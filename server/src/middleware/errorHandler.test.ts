import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import errorHandler from './errorHandler.js';

const ENV = { ...process.env };
afterEach(() => {
  process.env = { ...ENV };
  vi.restoreAllMocks();
});

function makeRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

const req = {} as Request;
const next = vi.fn() as unknown as NextFunction;

describe('errorHandler middleware', () => {
  it('uses the error status when provided', () => {
    const err = Object.assign(new Error('Forbidden'), { status: 403 });
    const res = makeRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
  });

  it('defaults to 500 when no status is set on the error', () => {
    const err = new Error('Something broke');
    const res = makeRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Something broke' });
  });

  it('uses "Internal Server Error" when the error has no message', () => {
    const err = new Error('');
    const res = makeRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });

  it('hides 5xx error details in production', () => {
    process.env.NODE_ENV = 'production';
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('SELECT * leaked secret table');
    const res = makeRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });

  it('still returns 4xx client messages in production', () => {
    process.env.NODE_ENV = 'production';
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = Object.assign(new Error('Trip not found'), { status: 404 });
    const res = makeRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Trip not found' });
  });

  it('logs the full error server-side', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = makeRes();
    errorHandler(new Error('boom'), req, res, next);
    expect(spy).toHaveBeenCalled();
  });
});
