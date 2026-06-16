import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction): void => {
  const status = err.status ?? 500;

  // Always log the full error (stack) server-side.
  console.error('[ERROR]', err.stack ?? err.message ?? err);

  // In production, never leak internal details for server errors (5xx).
  // Client errors (4xx) carry intentional, safe messages and are passed through.
  const isProd = process.env.NODE_ENV === 'production';
  const message =
    status >= 500 && isProd ? 'Internal Server Error' : err.message || 'Internal Server Error';

  res.status(status).json({ message });
};

export default errorHandler;
