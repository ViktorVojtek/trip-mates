import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createAuthLimiter } from './rateLimit.js';

describe('createAuthLimiter()', () => {
  it('returns 429 once the request limit is exceeded', async () => {
    const app = express();
    // Force the limiter on (it is skipped under NODE_ENV=test by default) and
    // use a tiny limit so the threshold is hit quickly.
    app.use(createAuthLimiter({ max: 2, skip: () => false }));
    app.post('/login', (_req, res) => res.json({ ok: true }));

    const r1 = await request(app).post('/login');
    const r2 = await request(app).post('/login');
    const r3 = await request(app).post('/login');

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(429);
    expect(r3.body.message).toMatch(/too many/i);
  });

  it('does not limit under the test environment by default', async () => {
    const app = express();
    app.use(createAuthLimiter({ max: 1 }));
    app.post('/login', (_req, res) => res.json({ ok: true }));

    await request(app).post('/login');
    const r2 = await request(app).post('/login');
    expect(r2.status).toBe(200); // skipped, so not throttled
  });
});
