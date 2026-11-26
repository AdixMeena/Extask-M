import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loginSchema, registerSchema } from '../validators/authValidators.js';
import { placeBidSchema } from '../validators/bidValidators.js';
import { createReviewSchema } from '../validators/reviewValidators.js';
import { createTaskSchema, listTasksSchema } from '../validators/taskValidators.js';
import { updateProfileSchema } from '../validators/userValidators.js';

const person = { name: 'Priya Sharma', username: 'priya', password: 'secret-123' };

describe('register', () => {
  it('accepts an email only account', () => {
    const data = registerSchema.parse({ ...person, email: 'PRIYA@example.com', phone: '' });
    assert.equal(data.email, 'priya@example.com');
    assert.equal(data.phone, undefined);
  });

  it('accepts a phone only account', () => {
    const data = registerSchema.parse({ ...person, phone: '+91 98765 43210' });
    assert.equal(data.phone, '9876543210');
  });

  it('needs an email or a phone number', () => {
    assert.equal(registerSchema.safeParse(person).success, false);
  });

  it('refuses the internal phone email domain', () => {
    const result = registerSchema.safeParse({
      ...person,
      email: '919876543210@phone.extask.app',
    });
    assert.equal(result.success, false);
  });

  it('refuses a username that looks like a phone number', () => {
    const result = registerSchema.safeParse({
      ...person,
      username: '9876543210',
      phone: '9876543210',
    });
    assert.equal(result.success, false);
  });

  it('refuses a short password', () => {
    const result = registerSchema.safeParse({ ...person, email: 'a@b.com', password: 'short' });
    assert.equal(result.success, false);
  });
});

describe('login', () => {
  it('needs both fields', () => {
    assert.equal(loginSchema.safeParse({ identifier: 'priya' }).success, false);
    assert.equal(loginSchema.safeParse({}).success, false);
  });
});

describe('tasks', () => {
  const task = {
    title: 'Fix a leaking tap',
    description: 'Kitchen tap drips all night.',
    budget: '400',
  };

  it('turns the budget into a number and blanks into null', () => {
    const data = createTaskSchema.parse({ ...task, category: '', deadline: '' });
    assert.equal(data.budget, 400);
    assert.equal(data.category, null);
    assert.equal(data.location, null);
    assert.equal(data.deadline, null);
  });

  it('refuses a zero or negative budget', () => {
    for (const budget of [0, -5, '', 'abc']) {
      assert.equal(createTaskSchema.safeParse({ ...task, budget }).success, false, `${budget}`);
    }
  });

  it('refuses a deadline in the past or in a wrong format', () => {
    assert.equal(createTaskSchema.safeParse({ ...task, deadline: '2000-01-01' }).success, false);
    assert.equal(createTaskSchema.safeParse({ ...task, deadline: '31/12/2099' }).success, false);
  });

  it('lists open tasks by default', () => {
    const query = listTasksSchema.parse({});
    assert.deepEqual([query.status, query.page, query.limit], ['open', 1, 12]);
  });

  it('ignores empty filters', () => {
    const query = listTasksSchema.parse({ q: '', minBudget: '', maxBudget: '', status: '' });
    assert.equal(query.minBudget, undefined);
    assert.equal(query.status, 'open');
  });

  it('refuses a minimum above the maximum', () => {
    assert.equal(listTasksSchema.safeParse({ minBudget: '500', maxBudget: '100' }).success, false);
  });
});

describe('bids, reviews and profiles', () => {
  it('accepts a bid with only a price', () => {
    const bid = placeBidSchema.parse({ amount: 350 });
    assert.deepEqual(bid, { amount: 350, message: null, availability: null });
  });

  it('only accepts whole ratings from 1 to 5', () => {
    assert.equal(createReviewSchema.safeParse({ rating: 5 }).success, true);
    for (const rating of [0, 6, 4.5, '5', undefined]) {
      assert.equal(createReviewSchema.safeParse({ rating }).success, false, `${rating}`);
    }
  });

  it('never lets a user verify themselves', () => {
    const data = updateProfileSchema.parse({
      name: 'Priya',
      id_verified: true,
      idVerified: true,
      rating_avg: 5,
    });
    assert.deepEqual(Object.keys(data).sort(), ['bio', 'idDetails', 'location', 'name']);
  });
});
