import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction): void => {
  const status = err.status ?? 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${message}`);
  res.status(status).json({ message });
};

export default errorHandler;
