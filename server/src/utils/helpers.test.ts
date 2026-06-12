import { describe, it, expect } from 'vitest';
import { paginate } from './helpers.js';

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('paginate()', () => {
  it('returns the first page of results', () => {
    const result = paginate(items, 1, 3);
    expect(result.results).toEqual([1, 2, 3]);
  });

  it('returns the second page of results', () => {
    const result = paginate(items, 2, 3);
    expect(result.results).toEqual([4, 5, 6]);
  });

  it('returns correct meta: totalItems, totalPages, page, pageSize', () => {
    const result = paginate(items, 1, 4);
    expect(result.meta.totalItems).toBe(10);
    expect(result.meta.totalPages).toBe(3);
    expect(result.meta.page).toBe(1);
    expect(result.meta.pageSize).toBe(4);
  });

  it('sets hasNextPage true and hasPreviousPage false on page 1', () => {
    const result = paginate(items, 1, 4);
    expect(result.meta.hasNextPage).toBe(true);
    expect(result.meta.hasPreviousPage).toBe(false);
  });

  it('sets hasNextPage false and hasPreviousPage true on the last page', () => {
    const result = paginate(items, 4, 3);
    expect(result.meta.hasNextPage).toBe(false);
    expect(result.meta.hasPreviousPage).toBe(true);
    expect(result.results).toEqual([10]);
  });

  it('returns empty results and zero totalPages for an empty array', () => {
    const result = paginate([], 1, 10);
    expect(result.results).toEqual([]);
    expect(result.meta.totalItems).toBe(0);
    expect(result.meta.totalPages).toBe(0);
    expect(result.meta.hasNextPage).toBe(false);
    expect(result.meta.hasPreviousPage).toBe(false);
  });
});
