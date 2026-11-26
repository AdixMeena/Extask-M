import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { unwrap } from '../utils/dbErrors.js';
import { PROFILE_SUMMARY_COLUMNS } from '../utils/serializers.js';
import { getTaskWithHire } from './taskService.js';
import { getPublicProfile } from './userService.js';

/** The poster rates the hired person and the hired person rates the poster. */
export async function createReview(taskId, reviewerId, { rating, comment }) {
  const { task, hired } = await getTaskWithHire(taskId);

  if (task.status !== 'completed') {
    throw new AppError(409, 'You can rate each other after the task is completed.');
  }
  if (!hired) {
    throw new AppError(409, 'The hired person is no longer on ExTask.');
  }

  let revieweeId;
  if (reviewerId === task.poster_id) revieweeId = hired.bidder_id;
  else if (reviewerId === hired.bidder_id) revieweeId = task.poster_id;
  else throw new AppError(403, 'Only the poster and the hired person can rate this task.');

  // The database allows one review per person per task, even for double clicks.
  const result = await supabaseAdmin()
    .from('reviews')
    .insert({
      task_id: taskId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating,
      comment,
    })
    .select('id, task_id, reviewer_id, reviewee_id, rating, comment, created_at')
    .single();

  if (result.error?.code === '23505') {
    throw new AppError(409, 'You have already rated this task.');
  }
  return unwrap(result).data;
}

export async function listReviewsForUser(userId) {
  await getPublicProfile(userId); // 404 for an unknown user

  const { data } = unwrap(
    await supabaseAdmin()
      .from('reviews')
      .select(
        `id, rating, comment, created_at,
         reviewer:profiles!reviews_reviewer_id_fkey(${PROFILE_SUMMARY_COLUMNS}),
         task:tasks!reviews_task_id_fkey(id, title)`,
      )
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
  );
  return data;
}
