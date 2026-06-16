import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validate } from './validate.js';

const schema = z.object({
  name: z.string().min(1),
  age: z.coerce.number().int().min(0),
});

function makeRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('validate()', () => {
  it('calls next and replaces body with parsed/coerced data on success', () => {
    const req = { body: { name: 'Al', age: '5' } } as Request;
    const res = makeRes();
    const next = vi.fn() as unknown as NextFunction;

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'Al', age: 5 }); // coerced to number
  });

  it('responds 400 with field errors on failure', () => {
    const req = { body: { name: '', age: 'x' } } as Request;
    const res = makeRes();
    const next = vi.fn() as unknown as NextFunction;

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    const body = vi.mocked(res.json).mock.calls[0][0] as { message: string; errors: unknown[] };
    expect(body.message).toBe('Validation failed');
    expect(body.errors.length).toBeGreaterThan(0);
  });
});
