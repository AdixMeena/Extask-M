import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { unwrap } from '../utils/dbErrors.js';
import { PROFILE_SUMMARY_COLUMNS } from '../utils/serializers.js';

/** Creates a bid, or updates the user's own pending bid. See place_bid in SQL. */
export async function placeBid(taskId, bidderId, { amount, message, availability }) {
  const { data } = unwrap(
    await supabaseAdmin().rpc('place_bid', {
      p_task_id: taskId,
      p_bidder_id: bidderId,
      p_amount: amount,
      p_message: message,
      p_availability: availability,
    }),
  );
  // A brand new bid has never been updated since it was created.
  return { bid: data, created: data.created_at === data.updated_at };
}

export async function listBidsForTask(taskId, requesterId) {
  const { data: task } = unwrap(
    await supabaseAdmin().from('tasks').select('poster_id').eq('id', taskId).maybeSingle(),
  );
  if (!task) throw new AppError(404, 'This task does not exist.');
  if (task.poster_id !== requesterId) {
    throw new AppError(403, 'Only the person who posted this task can see all the bids.');
  }

  const { data } = unwrap(
    await supabaseAdmin()
      .from('bids')
      .select(
        `id, task_id, amount, message, availability, status, created_at, updated_at,
         bidder:profiles!bids_bidder_id_fkey(${PROFILE_SUMMARY_COLUMNS})`,
      )
      .eq('task_id', taskId)
      .order('created_at')
      .order('id'),
  );
  return data;
}

export async function listMyBids(bidderId) {
  const { data } = unwrap(
    await supabaseAdmin()
      .from('bids')
      .select(
        `id, amount, message, availability, status, created_at, updated_at,
         task:tasks!bids_task_id_fkey(
           id, title, budget, location, deadline, status,
           poster:profiles!tasks_poster_id_fkey(${PROFILE_SUMMARY_COLUMNS})
         )`,
      )
      .eq('bidder_id', bidderId)
      .order('updated_at', { ascending: false }),
  );
  return data;
}
