/**
 * Fills the database with demo accounts, tasks, bids and reviews.
 *
 *   npm run seed                 add (or reset) the demo data
 *   npm run seed -- --remove     delete the demo data
 *
 * It goes through the same services as the API, so the data obeys every rule.
 * Only the demo accounts listed in seedData.js are ever deleted.
 */
import { supabaseAdmin } from '../config/supabase.js';
import { register } from '../services/authService.js';
import { placeBid } from '../services/bidService.js';
import { createReview } from '../services/reviewService.js';
import { cancelTask, completeTask, createTask, selectBid } from '../services/taskService.js';
import { unwrap } from '../utils/dbErrors.js';
import { phoneToAuthEmail } from '../utils/identifiers.js';
import { todayInIndia } from '../utils/text.js';
import { people, tasks } from './seedData.js';

const PASSWORD = process.env.DEMO_PASSWORD || 'Demo@1234';
const HOUR = 60 * 60 * 1000;

const authEmailOf = (person) => person.email ?? phoneToAuthEmail(person.phone);

/**
 * Removing a sign-in account also removes its profile, tasks, bids and reviews.
 * We search the sign-in accounts, not the profiles, so that accounts left over
 * after running reset.sql are cleared too.
 */
async function removeDemoData() {
  const { admin } = supabaseAdmin().auth;
  const demoEmails = new Set(people.map(authEmailOf));
  const found = [];

  // Collect first and delete afterwards, so the pages do not shift under us.
  const perPage = 200;
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.listUsers({ page, perPage });
    if (error) throw error;
    found.push(...data.users.filter((user) => demoEmails.has(user.email)));
    if (data.users.length < perPage) break;
  }

  for (const { id } of found) {
    const { error } = await admin.deleteUser(id);
    if (error) throw error;
  }
  return found.length;
}

async function createPeople() {
  const ids = {};
  for (const { location, bio, verified, ...account } of people) {
    const { user } = await register({ ...account, password: PASSWORD });
    unwrap(
      await supabaseAdmin()
        .from('profiles')
        .update({ location, bio, id_verified: verified })
        .eq('id', user.id),
    );
    ids[account.username] = user.id;
    console.log(`  account  ${account.username}`);
  }
  return ids;
}

async function createDemoTask(ids, spec) {
  const { poster, bids, hire, complete, cancel, reviews, dueInDays, hoursAgo, ...fields } = spec;
  const posterId = ids[poster];
  const deadline = todayInIndia(new Date(Date.now() + dueInDays * 24 * HOUR));

  const task = await createTask(posterId, { ...fields, deadline });
  unwrap(
    await supabaseAdmin()
      .from('tasks')
      .update({ created_at: new Date(Date.now() - hoursAgo * HOUR).toISOString() })
      .eq('id', task.id),
  );

  const bidIds = {};
  for (const { by, ...offer } of bids) {
    const { bid } = await placeBid(task.id, ids[by], offer);
    bidIds[by] = bid.id;
  }

  if (hire) await selectBid(task.id, bidIds[hire], posterId);
  if (complete) await completeTask(task.id, posterId);
  if (cancel) await cancelTask(task.id, posterId);
  if (reviews?.poster) await createReview(task.id, posterId, reviews.poster);
  if (reviews?.doer) await createReview(task.id, ids[hire], reviews.doer);

  console.log(`  task     ${fields.title}`);
}

async function main() {
  const removed = await removeDemoData();
  if (removed) console.log(`Removed ${removed} old demo accounts and their data.`);
  if (process.argv.includes('--remove')) return;

  console.log('Adding demo data...');
  const ids = await createPeople();
  for (const spec of tasks) await createDemoTask(ids, spec);

  console.log(`\nDone. Log in with any of these usernames: ${Object.keys(ids).join(', ')}`);
  console.log(`Password for all of them: ${PASSWORD}`);
}

try {
  await main();
} catch (error) {
  console.error(`\nSeeding failed: ${error.message}`);
  if (error.status === 409) {
    console.error('A real account is already using a demo username, email or phone.');
  }
  console.error('Run "npm run check" to test your setup.');
  process.exitCode = 1;
}
