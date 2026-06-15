import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../config/db.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
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
import usersRouter from './users.js';
import errorHandler from '../middleware/errorHandler.js';

const prismaMock = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);
app.use(errorHandler);

const publicProfile = {
  id: 'u2',
  name: 'Bob',
  bio: 'Traveler',
  profilePicture: null,
  familySize: 3,
  childrenAges: '5,8',
  travelPreferences: 'adventure',
  availability: '2026-07-01',
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.resetAllMocks();
  process.env.JWT_SECRET = 'test-secret';
  vi.mocked(jwt.verify).mockReturnValue({ userId: 'u1' } as never);
});

describe('GET /api/users/:id', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/users/u2');
    expect(res.status).toBe(401);
  });

  it('returns the public profile for authenticated user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(publicProfile);

    const res = await request(app)
      .get('/api/users/u2')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('u2');
    expect(res.body.name).toBe('Bob');
  });

  it('returns 404 when user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/users/missing')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'User not found' });
  });
});
