import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { unwrap } from '../utils/dbErrors.js';
import { CONTACT_COLUMNS, PROFILE_SUMMARY_COLUMNS } from '../utils/serializers.js';
import { containsPattern } from '../utils/text.js';

// "!constraint_name" tells Supabase which relationship to follow, because
// tasks are linked to profiles and bids in more than one way.
const TASK_COLUMNS = `
  id, poster_id, title, description, category, budget, location, deadline, status, created_at,
  poster:profiles!tasks_poster_id_fkey(${PROFILE_SUMMARY_COLUMNS}),
  bids:bids!bids_task_id_fkey(count)
`;

/** Shapes a database row into what the client receives. */
function toTask({ bids, ...task }) {
  return { ...task, bidCount: bids?.[0]?.count ?? 0 };
}

export async function createTask(posterId, input) {
  const { data } = unwrap(
    await supabaseAdmin()
      .from('tasks')
      .insert({ ...input, poster_id: posterId })
      .select(TASK_COLUMNS)
      .single(),
  );
  return toTask(data);
}

export async function listTasks(filters) {
  const { q, category, location, minBudget, maxBudget, status, page, limit } = filters;

  let query = supabaseAdmin().from('tasks').select(TASK_COLUMNS, { count: 'exact' });

  if (status !== 'all') query = query.eq('status', status);
  if (q) query = query.ilike('search_text', containsPattern(q));
  if (category) query = query.ilike('category', containsPattern(category));
  if (location) query = query.ilike('location', containsPattern(location));
  if (minBudget !== undefined) query = query.gte('budget', minBudget);
  if (maxBudget !== undefined) query = query.lte('budget', maxBudget);

  const from = (page - 1) * limit;
  const result = await query
    .order('created_at', { ascending: false })
    .order('id') // keeps pages stable when two tasks share a timestamp
    .range(from, from + limit - 1);

  // Asking for a page past the end is not an error, just an empty page.
  if (result.error?.code === 'PGRST103') {
    return { tasks: [], pagination: { page, limit, total: 0, totalPages: 0 } };
  }

  const { data, count } = unwrap(result);
  return {
    tasks: data.map(toTask),
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function listTasksByPoster(posterId) {
  const { data } = unwrap(
    await supabaseAdmin()
      .from('tasks')
      .select(TASK_COLUMNS)
      .eq('poster_id', posterId)
      .order('created_at', { ascending: false }),
  );
  return data.map(toTask);
}

/** The task plus who was hired. Throws 404 if it does not exist. */
export async function getTaskWithHire(taskId) {
  const { data } = unwrap(
    await supabaseAdmin()
      .from('tasks')
      .select(
        `${TASK_COLUMNS},
         hired:bids!tasks_selected_bid_fk(
           id, amount, availability, bidder_id,
           bidder:profiles!bids_bidder_id_fkey(${PROFILE_SUMMARY_COLUMNS})
         )`,
      )
      .eq('id', taskId)
      .maybeSingle(),
  );
  if (!data) throw new AppError(404, 'This task does not exist.');

  const { hired, ...task } = data;
  return { task: toTask(task), hired };
}

async function getReviewsForTask(taskId) {
  const { data } = unwrap(
    await supabaseAdmin()
      .from('reviews')
      .select(
        `id, rating, comment, created_at, reviewer_id, reviewee_id,
         reviewer:profiles!reviews_reviewer_id_fkey(${PROFILE_SUMMARY_COLUMNS})`,
      )
      .eq('task_id', taskId)
      .order('created_at'),
  );
  return data;
}

async function getContact(userId) {
  const { data } = unwrap(
    await supabaseAdmin().from('profiles').select(CONTACT_COLUMNS).eq('id', userId).single(),
  );
  return data;
}

/**
 * Everything the task page needs. What is returned depends on who is asking:
 * the hired person's price and the contact details are only for the two people
 * involved in the job.
 */
export async function getTaskDetail(taskId, viewerId) {
  const { task, hired } = await getTaskWithHire(taskId);
  const reviews = await getReviewsForTask(taskId);

  if (!viewerId) return { task, reviews, viewer: null };

  const isOwner = task.poster_id === viewerId;
  const isHired = hired?.bidder_id === viewerId;
  const viewer = {
    isOwner,
    isHired,
    hasReviewed: reviews.some((review) => review.reviewer_id === viewerId),
    myBid: null,
    hired: null,
    contact: null,
  };

  if (!isOwner) {
    const { data } = unwrap(
      await supabaseAdmin()
        .from('bids')
        .select('id, amount, message, availability, status, created_at, updated_at')
        .eq('task_id', taskId)
        .eq('bidder_id', viewerId)
        .maybeSingle(),
    );
    viewer.myBid = data;
  }

  // There is no chat yet, so once someone is hired the two need a way to talk.
  if (hired && (isOwner || isHired)) {
    viewer.hired = hired;
    viewer.contact = await getContact(isOwner ? hired.bidder_id : task.poster_id);
  }

  return { task, reviews, viewer };
}

export async function selectBid(taskId, bidId, posterId) {
  unwrap(
    await supabaseAdmin().rpc('select_bid', {
      p_task_id: taskId,
      p_bid_id: bidId,
      p_poster_id: posterId,
    }),
  );
  return getTaskDetail(taskId, posterId);
}

export async function cancelTask(taskId, posterId) {
  unwrap(await supabaseAdmin().rpc('cancel_task', { p_task_id: taskId, p_poster_id: posterId }));
  return getTaskDetail(taskId, posterId);
}

export async function completeTask(taskId, posterId) {
  // The conditions are part of the update itself, so there is no gap between
  // checking them and changing the row.
  const { data } = unwrap(
    await supabaseAdmin()
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId)
      .eq('poster_id', posterId)
      .eq('status', 'assigned')
      .select('id'),
  );

  if (!data.length) {
    // Nothing changed: find out why, to give a useful message.
    const { task } = await getTaskWithHire(taskId);
    if (task.poster_id !== posterId) {
      throw new AppError(403, 'Only the person who posted this task can do that.');
    }
    throw new AppError(409, 'Only a task with a hired person can be marked completed.');
  }

  return getTaskDetail(taskId, posterId);
}
