import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import { createApp, resolveCorsOrigin } from './app.js';

const ENV = { ...process.env };
afterEach(() => {
  process.env = { ...ENV };
});

describe('resolveCorsOrigin()', () => {
  it('uses CLIENT_ORIGIN when set', () => {
    process.env.CLIENT_ORIGIN = 'http://allowed.com';
    expect(resolveCorsOrigin()).toBe('http://allowed.com');
  });

  it('allows * in non-production when CLIENT_ORIGIN is unset', () => {
    delete process.env.CLIENT_ORIGIN;
    process.env.NODE_ENV = 'development';
    expect(resolveCorsOrigin()).toBe('*');
  });

  it('refuses * (returns false) in production when CLIENT_ORIGIN is unset', () => {
    delete process.env.CLIENT_ORIGIN;
    process.env.NODE_ENV = 'production';
    expect(resolveCorsOrigin()).toBe(false);
  });
});

describe('security middleware', () => {
  it('sets helmet headers and does not reflect a disallowed origin', async () => {
    process.env.CLIENT_ORIGIN = 'http://allowed.com';
    const app = createApp();

    const res = await request(app).get('/api/health').set('Origin', 'http://evil.com');

    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff'); // helmet
    expect(res.headers['access-control-allow-origin']).not.toBe('http://evil.com');
  });
});
