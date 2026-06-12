import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

import jwt from 'jsonwebtoken';
import auth from './auth.js';

function makeReq(authHeader?: string): Request {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  } as unknown as Request;
}

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

beforeEach(() => {
  vi.resetAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('auth middleware', () => {
  it('returns 401 when Authorization header is missing', () => {
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when header does not start with Bearer', () => {
    const req = makeReq('Token abc123');
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and sets req.userId when token is valid', () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 'user-42' } as never);

    const req = makeReq('Bearer valid-token');
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    auth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect((req as any).userId).toBe('user-42');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error('invalid'); });

    const req = makeReq('Bearer bad-token');
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is expired', () => {
    vi.mocked(jwt.verify).mockImplementation(() => {
      const err = new Error('jwt expired');
      (err as any).name = 'TokenExpiredError';
      throw err;
    });

    const req = makeReq('Bearer expired-token');
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });
});
