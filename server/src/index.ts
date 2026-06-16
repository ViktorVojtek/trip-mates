import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from './config/db.js';
import { createApp, resolveCorsOrigin } from './app.js';
import { gracefulShutdown } from './shutdown.js';

const app = createApp();
const PORT = process.env.PORT ?? 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: resolveCorsOrigin() },
});

// Authenticate the socket handshake with the same JWT used for the REST API,
// then join a room named after the user id so we can target them directly.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('unauthorized'));
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    (socket.data as { userId?: string }).userId = payload.userId;
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  const userId = (socket.data as { userId?: string }).userId;
  if (userId) socket.join(userId);
});

// Expose io to route handlers via req.app.get('io').
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = gracefulShutdown({ httpServer, io, prisma });
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
