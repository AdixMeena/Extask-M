import { supabaseAdmin } from '../config/supabase.js';
import { unwrap } from '../utils/dbErrors.js';

/** Counts rows without downloading them. */
async function count(table, status) {
  let query = supabaseAdmin().from(table).select('id', { count: 'exact', head: true });
  if (status) query = query.eq('status', status);
  return unwrap(await query).count;
}

/** Real numbers for the home page. */
export async function getStats() {
  const [openTasks, completedTasks, members, bids] = await Promise.all([
    count('tasks', 'open'),
    count('tasks', 'completed'),
    count('profiles'),
    count('bids'),
  ]);
  return { openTasks, completedTasks, members, bids };
}
