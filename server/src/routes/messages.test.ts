import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../config/db.js', () => ({
  default: {
    message: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

import prisma from '../config/db.js';
import jwt from 'jsonwebtoken';
import messagesRouter from './messages.js';
import errorHandler from '../middleware/errorHandler.js';

const prismaMock = prisma as unknown as {
  message: {
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

const app = express();
app.use(express.json());
app.use('/api/messages', messagesRouter);
app.use(errorHandler);

const msgRow = {
  id: 'm1',
  content: 'Hello',
  tripId: null,
  senderId: 'u1',
  receiverId: 'u2',
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.resetAllMocks();
  process.env.JWT_SECRET = 'test-secret';
  vi.mocked(jwt.verify).mockReturnValue({ userId: 'u1' } as never);
});

describe('GET /api/messages', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/messages');
    expect(res.status).toBe(401);
  });

  it('returns messages for authenticated user', async () => {
    prismaMock.message.findMany.mockResolvedValue([msgRow]);

    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe('m1');
  });

  it('filters by userId query param', async () => {
    prismaMock.message.findMany.mockResolvedValue([msgRow]);

    const res = await request(app)
      .get('/api/messages?userId=u2')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(prismaMock.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { senderId: 'u1', receiverId: 'u2' },
            { senderId: 'u2', receiverId: 'u1' },
          ],
        },
      })
    );
  });
});

describe('POST /api/messages', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/messages').send({ content: 'Hi', receiverId: 'u2' });
    expect(res.status).toBe(401);
  });

  it('rejects a message with no content (400)', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', 'Bearer valid-token')
      .send({ receiverId: 'u2' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('sends a message and returns 201', async () => {
    prismaMock.message.create.mockResolvedValue(msgRow);

    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', 'Bearer valid-token')
      .send({ content: 'Hello', receiverId: 'u2' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('m1');
    expect(res.body.content).toBe('Hello');
  });
});
