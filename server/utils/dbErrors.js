import { AppError } from './AppError.js';

/** Codes raised by the SQL functions in db/schema.sql. */
const RULE_ERRORS = {
  TASK_NOT_FOUND: [404, 'This task does not exist.'],
  BID_NOT_FOUND: [404, 'That bid is not available on this task.'],
  NOT_TASK_OWNER: [403, 'Only the person who posted this task can do that.'],
  OWN_TASK: [403, 'You cannot bid on your own task.'],
  TASK_NOT_OPEN: [409, 'This task is no longer open.'],
  BID_NOT_PENDING: [409, 'This bid has already been answered and cannot be changed.'],
};

/**
 * Supabase returns { data, error } instead of throwing. This turns an error
 * into a thrown one, so services can be written as straight-line code.
 *
 * @template T
 * @param {{ data: T, error: any, count?: number | null }} result
 * @returns {{ data: T, count?: number | null }}
 */
export function unwrap(result) {
  const { error } = result;
  if (!error) return result;

  const rule = RULE_ERRORS[error.message];
  if (rule) throw new AppError(...rule);

  if (error.code === '23505') throw new AppError(409, 'That already exists.');

  // Unexpected database error: keep the original for the server log.
  throw new Error(`Database error ${error.code ?? ''}: ${error.message}`, { cause: error });
}
