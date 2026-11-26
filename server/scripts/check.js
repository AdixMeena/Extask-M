/**
 * "npm run check": confirms your .env keys and database are set up correctly
 * and says what to fix if they are not.
 */
import { env, missingEnv } from '../config/env.js';
import { supabaseAdmin, supabasePublic } from '../config/supabase.js';

const RUN_SCHEMA = 'Run server/db/schema.sql in the Supabase SQL Editor.';
let failed = false;

function report(ok, label, hint) {
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}`);
  if (!ok) {
    failed = true;
    if (hint) console.log(`      ${hint}`);
  }
}

function explain(error) {
  if (!error) return '';
  const text = `${error.code ?? ''} ${error.message ?? ''}`;
  if (/PGRST20[25]|42P01|schema cache|does not exist/i.test(text)) return RUN_SCHEMA;
  if (/42501|permission denied/i.test(text)) {
    return `Permission missing. ${RUN_SCHEMA} Also check SUPABASE_SERVICE_ROLE_KEY is the SECRET key.`;
  }
  if (/api key|jwt|401/i.test(text)) return 'A key is wrong. Copy it again from Supabase.';
  if (/fetch failed|ENOTFOUND|ECONNREFUSED/i.test(text)) {
    return 'Cannot reach Supabase. Check SUPABASE_URL, your internet, and that the project is not paused.';
  }
  return text.trim();
}

async function main() {
  const missing = missingEnv();
  report(!missing.length, 'Environment variables', `Set ${missing.join(', ')} in server/.env`);
  if (missing.length) return;

  report(
    env.supabaseAnonKey !== env.supabaseServiceKey,
    'Publishable and secret keys are different',
    'You pasted the same key twice.',
  );

  const admin = supabaseAdmin();

  for (const table of ['profiles', 'tasks', 'bids', 'reviews']) {
    const { error } = await admin.from(table).select('id').limit(1);
    report(!error, `Table "${table}"`, explain(error));
  }

  // A made-up task id: the function existing means it answers TASK_NOT_FOUND.
  const nothing = '00000000-0000-4000-8000-000000000000';
  const rpc = await admin.rpc('cancel_task', { p_task_id: nothing, p_poster_id: nothing });
  report(rpc.error?.message === 'TASK_NOT_FOUND', 'Database functions', explain(rpc.error));

  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  report(!users.error, 'Secret key can manage users', explain(users.error));

  // A bad token should be rejected for being a bad token, not for a bad key.
  const probe = await supabasePublic().auth.signInWithPassword({
    email: 'nobody@example.com',
    password: 'not-a-real-password',
  });
  report(
    probe.error?.code === 'invalid_credentials',
    'Publishable key can sign users in',
    explain(probe.error) || 'Enable Email sign-in under Authentication > Providers.',
  );
}

try {
  await main();
} catch (error) {
  report(false, 'Setup check', explain(error));
}

console.log(failed ? '\nFix the lines marked FAIL and run this again.' : '\nAll set.');
process.exitCode = failed ? 1 : 0;
