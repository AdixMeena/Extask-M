/**
 * HTTP behaviour that does not need a database: validation, login checks and
 * error formatting. The full flow is covered by tests/e2e/flow.js.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'http://localhost:5173';
const { createApp } = await import('../createApp.js');
const app = createApp();
const ID = '11111111-1111-4111-8111-111111111111';

describe('API basics', () => {
  it('reports health', async () => {
    const res = await request(app).get('/api/health').expect(200);
    assert.equal(res.body.status, 'ok');
  });

  it('answers unknown routes with a JSON 404', async () => {
    const res = await request(app).get('/api/nope').expect(404);
    assert.match(res.body.error.message, /No such API route/);
  });

  it('rejects broken JSON', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{oops')
      .expect(400);
    assert.match(res.body.error.message, /not valid JSON/);
  });

  it('lists every invalid field', async () => {
    const res = await request(app).post('/api/auth/register').send({}).expect(400);
    const fields = res.body.error.details.map((detail) => detail.field);
    for (const field of ['name', 'username', 'password']) assert.ok(fields.includes(field), field);
  });

  it('rejects a task id that is not a UUID', async () => {
    await request(app).get('/api/tasks/123').expect(400);
  });

  it('protects every private route', async () => {
    const routes = [
      ['get', '/api/auth/me'],
      ['post', '/api/auth/logout'],
      ['put', '/api/users/me'],
      ['post', '/api/tasks'],
      ['get', '/api/tasks/mine'],
      ['put', `/api/tasks/${ID}/cancel`],
      ['put', `/api/tasks/${ID}/complete`],
      ['put', `/api/tasks/${ID}/select/${ID}`],
      ['get', `/api/tasks/${ID}/bids`],
      ['post', `/api/tasks/${ID}/bids`],
      ['get', '/api/bids/mine'],
      ['post', `/api/tasks/${ID}/reviews`],
    ];
    for (const [method, path] of routes) {
      const res = await request(app)[method](path);
      assert.equal(res.status, 401, `${method.toUpperCase()} ${path}`);
    }
  });

  it('allows the configured website through CORS and no other', async () => {
    const ok = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    const no = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    assert.equal(ok.headers['access-control-allow-origin'], 'http://localhost:5173');
    assert.equal(no.headers['access-control-allow-origin'], undefined);
  });
});
