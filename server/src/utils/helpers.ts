import type { PaginatedResult } from '../types/index.js';

const paginate = <T>(items: T[], page: number, pageSize: number): PaginatedResult<T> => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const results = items.slice(start, end);
  const totalPages = Math.ceil(items.length / pageSize);
  const meta = {
    page,
    pageSize,
    totalItems: items.length,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
  return { results, meta };
};

export { paginate };
