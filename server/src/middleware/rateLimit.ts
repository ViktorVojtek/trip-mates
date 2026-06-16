import rateLimit, { type Options } from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints. Defaults to 10 requests/minute/IP.
 * Skipped under the test environment so the suite isn't throttled; pass
 * `{ skip: () => false }` to exercise it directly in a test.
 */
export const createAuthLimiter = (overrides: Partial<Options> = {}) =>
  rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
    skip: () => process.env.NODE_ENV === 'test',
    ...overrides,
  });
