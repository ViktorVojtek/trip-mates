import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../config/db.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));
vi.mock('google-auth-library', () => ({
  OAuth2Client: vi.fn(() => ({ verifyIdToken })),
}));

import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRouter from './auth.js';
import errorHandler from '../middleware/errorHandler.js';

const prismaMock = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
  };
};

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use(errorHandler);

beforeEach(() => {
  vi.resetAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('POST /api/auth/register', () => {
  it('returns 400 when the email is already taken', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'pw123', name: 'Alice' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'User already exists' });
  });

  it('returns 201 with user and token on success', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-pw' as never);
    const createdUser = { id: 'u1', email: 'a@b.com', name: 'Alice', familySize: 1, childrenAges: null, createdAt: new Date().toISOString() };
    prismaMock.user.create.mockResolvedValue(createdUser);
    vi.mocked(jwt.sign).mockReturnValue('tok' as never);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'pw123', name: 'Alice' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBe('tok');
    expect(res.body.user.id).toBe('u1');
  });
});

describe('POST /api/auth/login', () => {
  it('returns 401 when user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@b.com', password: 'pw' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
  });

  it('returns 401 when password is wrong', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', password: 'hashed' });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('returns 200 with user and token on success', async () => {
    const dbUser = { id: 'u1', email: 'a@b.com', name: 'Alice', familySize: 1, childrenAges: null, createdAt: new Date(), password: 'hashed' };
    prismaMock.user.findUnique.mockResolvedValue(dbUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue('tok' as never);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'pw' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('tok');
    expect(res.body.user.email).toBe('a@b.com');
  });
});

describe('POST /api/auth/google', () => {
  it('returns 400 when credential is missing', async () => {
    const res = await request(app).post('/api/auth/google').send({});
    expect(res.status).toBe(400);
  });

  it('returns 200 with user and token for a valid credential', async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({ email: 'g@b.com', name: 'Gina' }),
    });
    prismaMock.user.upsert.mockResolvedValue({
      id: 'u9', email: 'g@b.com', name: 'Gina', familySize: 1, childrenAges: null,
      createdAt: new Date().toISOString(),
    });
    vi.mocked(jwt.sign).mockReturnValue('tok' as never);

    const res = await request(app).post('/api/auth/google').send({ credential: 'id-token' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('tok');
    expect(res.body.user.email).toBe('g@b.com');
  });
});

describe('GET /api/auth/profile', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('returns 401 for an invalid token', async () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error('bad token'); });

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer bad');

    expect(res.status).toBe(401);
  });

  it('returns 200 with profile for a valid token', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 'u1' } as never);
    const profile = { id: 'u1', email: 'a@b.com', name: 'Alice', bio: null, profilePicture: null, familySize: 1, childrenAges: null, travelPreferences: null, availability: null, interests: null, createdAt: new Date().toISOString() };
    prismaMock.user.findUnique.mockResolvedValue(profile);

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('u1');
  });
});

describe('PUT /api/auth/profile', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).put('/api/auth/profile').send({ name: 'Bob' });
    expect(res.status).toBe(401);
  });

  it('returns 200 with updated profile on success', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: 'u1' } as never);
    const updated = { id: 'u1', email: 'a@b.com', name: 'Bob', bio: null, profilePicture: null, familySize: 1, childrenAges: null, travelPreferences: null, availability: null, createdAt: new Date().toISOString() };
    prismaMock.user.update.mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'Bob' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Bob');
  });
});
