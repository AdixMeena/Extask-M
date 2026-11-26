/**
 * End-to-end check of the whole product against YOUR Supabase project, using
 * the keys in server/.env:  npm run test:e2e
 *
 * It creates three temporary users, walks through post > bid > hire > complete
 * > rate (plus the rules that must be refused), then deletes those users and
 * everything they created.
 */
import assert from 'node:assert/strict';

// Keeps request logging quiet while still printing real server errors.
process.env.NODE_ENV = 'e2e';
const { supabaseAdmin } = await import('../../config/supabase.js');
const { createApp } = await import('../../createApp.js');

const run = Date.now().toString(36);
const password = `E2e-${run}-pass`;
const createdIds = [];
let base;
let step = 0;

async function api(method, path, { token, body, expect = 200 } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  const data = res.status === 204 ? null : await res.json();
  assert.equal(
    res.status,
    expect,
    `${method} ${path} gave ${res.status}, expected ${expect}: ${JSON.stringify(data)}`,
  );
  return data;
}

const passed = (text) => console.log(`  ${String(++step).padStart(2)}. ${text}`);

async function register(name, contact) {
  const data = await api('POST', '/auth/register', {
    body: { name, username: `${name.toLowerCase()}_${run}`, password, ...contact },
    expect: 201,
  });
  createdIds.push(data.user.id);
  return data;
}

async function main() {
  const tag = `e2e${run}`;
  const phone = `9${String(Date.now()).slice(-9)}`;

  const poster = await register('Poster', { email: `poster.${run}@example.com` });
  const doer = await register('Doer', { phone });
  const other = await register('Other', { email: `other.${run}@example.com` });
  assert.equal(poster.user.auth_email, undefined);
  passed('Registers with email only and with phone only');

  await api('POST', '/auth/register', {
    body: {
      name: 'Copy',
      username: poster.user.username,
      email: `copy.${run}@example.com`,
      password,
    },
    expect: 409,
  });
  passed('Refuses a username that is already taken');

  for (const identifier of [doer.user.username.toUpperCase(), `+91 ${phone}`]) {
    await api('POST', '/auth/login', { body: { identifier, password } });
  }
  await api('POST', '/auth/login', { body: { identifier: poster.user.email, password } });
  await api('POST', '/auth/login', {
    body: { identifier: poster.user.email, password: 'wrong-password' },
    expect: 401,
  });
  passed('Logs in by username, phone and email, and refuses a wrong password');

  await api('GET', '/auth/me', { token: 'not-a-token', expect: 401 });
  const renewed = await api('POST', '/auth/refresh', {
    body: { refreshToken: poster.refreshToken },
  });
  poster.accessToken = renewed.accessToken;
  const me = await api('GET', '/auth/me', { token: poster.accessToken });
  assert.equal(me.user.id, poster.user.id);
  passed('Checks tokens and renews a session');

  const profile = await api('PUT', '/users/me', {
    token: doer.accessToken,
    body: { name: 'Doer', location: 'Indore', idDetails: 'Student ID 1234', id_verified: true },
  });
  assert.equal(profile.user.id_verified, false);
  const publicProfile = await api('GET', `/users/${doer.user.id}`);
  for (const secret of ['phone', 'email', 'id_details', 'auth_email']) {
    assert.equal(publicProfile.user[secret], undefined, secret);
  }
  passed('Edits a profile without self-verifying; private fields stay private');

  const newTask = {
    title: `Fix a leaking tap ${tag}`,
    description: 'Kitchen tap drips all night. 100% sure it is the washer.',
    category: 'Plumbing',
    budget: 400,
    location: 'Vijay Nagar, Indore',
  };
  const { task } = await api('POST', '/tasks', {
    token: poster.accessToken,
    body: newTask,
    expect: 201,
  });
  passed('Posts a task');

  const found = await api(
    'GET',
    `/tasks?q=${tag}&category=plumb&location=indore&minBudget=100&maxBudget=500`,
  );
  assert.equal(found.pagination.total, 1);
  assert.equal(found.tasks[0].poster.id, poster.user.id);
  assert.equal((await api('GET', `/tasks?q=${tag}&minBudget=401`)).pagination.total, 0);
  assert.equal((await api('GET', `/tasks?q=${tag}&page=9`)).tasks.length, 0);
  assert.equal((await api('GET', '/tasks/mine', { token: poster.accessToken })).tasks.length, 1);
  passed('Searches and filters tasks');

  const bids = `/tasks/${task.id}/bids`;
  await api('POST', bids, { token: poster.accessToken, body: { amount: 300 }, expect: 403 });
  passed('Refuses a bid on your own task');

  const first = await api('POST', bids, {
    token: doer.accessToken,
    body: { amount: 380, message: 'I can come today.', availability: 'Today evening' },
    expect: 201,
  });
  const updated = await api('POST', bids, { token: doer.accessToken, body: { amount: 350 } });
  assert.equal(updated.bid.id, first.bid.id);
  assert.equal(updated.bid.amount, 350);
  const second = await api('POST', bids, {
    token: other.accessToken,
    body: { amount: 420 },
    expect: 201,
  });
  passed('Places bids; bidding again updates the same bid');

  await api('GET', bids, { token: doer.accessToken, expect: 403 });
  const seen = await api('GET', bids, { token: poster.accessToken });
  assert.equal(seen.bids.length, 2);
  assert.equal(seen.bids[0].bidder.phone, undefined);
  assert.equal((await api('GET', `/tasks/${task.id}`)).task.bidCount, 2);
  passed('Shows all bids to the poster only');

  await api('PUT', `/tasks/${task.id}/complete`, { token: poster.accessToken, expect: 409 });
  await api('POST', `/tasks/${task.id}/reviews`, {
    token: poster.accessToken,
    body: { rating: 5 },
    expect: 409,
  });
  await api('PUT', `/tasks/${task.id}/select/${first.bid.id}`, {
    token: doer.accessToken,
    expect: 403,
  });
  passed('Refuses early completion, early reviews and hiring by a non-owner');

  const hired = await api('PUT', `/tasks/${task.id}/select/${first.bid.id}`, {
    token: poster.accessToken,
  });
  assert.equal(hired.task.status, 'assigned');
  assert.equal(hired.viewer.contact.phone, phone);
  const after = await api('GET', bids, { token: poster.accessToken });
  assert.deepEqual(Object.fromEntries(after.bids.map((bid) => [bid.id, bid.status])), {
    [first.bid.id]: 'accepted',
    [second.bid.id]: 'rejected',
  });
  passed('Hires one bidder and rejects the rest');

  const asDoer = await api('GET', `/tasks/${task.id}`, { token: doer.accessToken });
  assert.equal(asDoer.viewer.contact.email, poster.user.email);
  const asOther = await api('GET', `/tasks/${task.id}`, { token: other.accessToken });
  assert.equal(asOther.viewer.contact, null);
  assert.equal((await api('GET', `/tasks/${task.id}`)).viewer, null);
  passed('Shares contact details only between poster and hired person');

  await api('POST', bids, { token: other.accessToken, body: { amount: 100 }, expect: 409 });
  await api('PUT', `/tasks/${task.id}/select/${second.bid.id}`, {
    token: poster.accessToken,
    expect: 409,
  });
  await api('PUT', `/tasks/${task.id}/cancel`, { token: poster.accessToken, expect: 409 });
  passed('Closes bidding, re-hiring and cancelling once assigned');

  await api('PUT', `/tasks/${task.id}/complete`, { token: doer.accessToken, expect: 403 });
  const done = await api('PUT', `/tasks/${task.id}/complete`, { token: poster.accessToken });
  assert.equal(done.task.status, 'completed');
  passed('Only the poster marks the task completed');

  const reviews = `/tasks/${task.id}/reviews`;
  await api('POST', reviews, { token: other.accessToken, body: { rating: 1 }, expect: 403 });
  await api('POST', reviews, {
    token: poster.accessToken,
    body: { rating: 4, comment: 'On time and neat.' },
    expect: 201,
  });
  await api('POST', reviews, { token: poster.accessToken, body: { rating: 5 }, expect: 409 });
  await api('POST', reviews, { token: doer.accessToken, body: { rating: 5 }, expect: 201 });
  const rated = await api('GET', `/users/${doer.user.id}`);
  assert.equal(rated.user.rating_avg, 4);
  assert.equal(rated.user.rating_count, 1);
  const list = await api('GET', `/users/${doer.user.id}/reviews`);
  assert.equal(list.reviews[0].task.id, task.id);
  passed('Lets both sides rate once and updates the average');

  const mine = await api('GET', '/bids/mine', { token: doer.accessToken });
  assert.equal(mine.bids[0].status, 'accepted');
  assert.equal(mine.bids[0].task.status, 'completed');
  passed('Shows bid status to the bidder');

  const { task: spare } = await api('POST', '/tasks', {
    token: poster.accessToken,
    body: { ...newTask, title: `Move a cupboard ${tag}` },
    expect: 201,
  });
  await api('POST', `/tasks/${spare.id}/bids`, {
    token: doer.accessToken,
    body: { amount: 200 },
    expect: 201,
  });
  const cancelled = await api('PUT', `/tasks/${spare.id}/cancel`, { token: poster.accessToken });
  assert.equal(cancelled.task.status, 'cancelled');
  const closed = await api('GET', '/bids/mine', { token: doer.accessToken });
  assert.equal(closed.bids.find((bid) => bid.task.id === spare.id).status, 'rejected');
  passed('Cancels an open task and closes its bids');

  const { stats } = await api('GET', '/stats');
  assert.ok(stats.members >= 3 && stats.completedTasks >= 1);
  await api('GET', '/tasks/00000000-0000-4000-8000-000000000000', { expect: 404 });
  await api('POST', '/auth/logout', { token: other.accessToken, expect: 204 });
  passed('Serves stats, 404s and logout');
}

const server = createApp().listen(0);
await new Promise((resolve) => server.once('listening', resolve));
base = `http://127.0.0.1:${server.address().port}/api`;

console.log('Running the end-to-end flow...\n');
try {
  await main();
  console.log(`\nAll ${step} checks passed.`);
} catch (error) {
  console.error(`\nFailed after check ${step}:\n${error.message}`);
  process.exitCode = 1;
} finally {
  // Deleting the sign-in account removes the profile, tasks, bids and reviews.
  for (const id of createdIds) await supabaseAdmin().auth.admin.deleteUser(id);
  server.close();
}
