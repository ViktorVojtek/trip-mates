import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { uploadsDir } from './middleware/upload.js';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import errorHandler from './middleware/errorHandler.js';

/**
 * Resolves the allowed CORS origin. Uses CLIENT_ORIGIN when set; otherwise
 * allows all in non-production but refuses `*` in production (returns false,
 * which denies cross-origin requests) to avoid an accidentally open API.
 */
export const resolveCorsOrigin = (): string | boolean => {
  const clientOrigin = process.env.CLIENT_ORIGIN;
  if (clientOrigin) return clientOrigin;
  return process.env.NODE_ENV === 'production' ? false : '*';
};

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: resolveCorsOrigin() }));
  app.use(morgan('dev', { skip: () => process.env.NODE_ENV === 'test' }));
  app.use(express.json());

  // Serve uploaded avatars.
  app.use('/uploads', express.static(uploadsDir));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/users', userRoutes);

  app.use(errorHandler);

  return app;
}
