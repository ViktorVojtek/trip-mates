import { describe, it, expect } from 'vitest';
import { createZodResolver } from './zodResolver';
import { z } from 'zod';

// ─── Valid data passes through with `values` ───────────────────────────
describe('valid data', () => {
  it('returns the parsed data in `values`', async () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const resolver = createZodResolver(schema);
    const result = await resolver({ name: 'Alice', age: 30 }, undefined, {} as any);
    expect(result).toEqual({ values: { name: 'Alice', age: 30 }, errors: {} });
  });
});

// ─── Invalid data returns structured errors ─────────────────────────────
describe('invalid data', () => {
  it('returns structured errors on failure', async () => {
    const schema = z.object({ name: z.string().min(3) });
    const resolver = createZodResolver(schema);
    const result = await resolver({ name: 'Ab' }, undefined, {} as any);
    expect(result.errors).toBeDefined();
    expect(result.errors.name).toBeDefined();
    expect(result.errors.name?.message).toContain('character');
    expect(result.values).toEqual({});
  });
});

// ─── Multiple validation errors are collected ───────────────────────────
describe('multiple errors', () => {
  it('collects errors for all failed fields', async () => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
    });
    const resolver = createZodResolver(schema);
    const result = await resolver({ name: 'a', email: 'not-an-email' }, undefined, {} as any);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.email).toBeDefined();
  });
});

// ─── Empty string required field produces error ─────────────────────────
describe('empty string required field', () => {
  it('reports an error when a required string is empty', async () => {
    const schema = z.object({ name: z.string().min(1) });
    const resolver = createZodResolver(schema);
    const result = await resolver({ name: '' }, undefined, {} as any);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.name?.message).toBeDefined();
    expect(result.values).toEqual({});
  });
});
