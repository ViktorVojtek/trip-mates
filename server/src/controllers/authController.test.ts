import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../config/db.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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
  },
}));

import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { register, login, getProfile, updateProfile } from './authController.js';

const prismaMock = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

function makeRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

const next = vi.fn() as unknown as NextFunction;

beforeEach(() => {
  vi.resetAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('register()', () => {
  it('returns 400 when the email is already taken', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    const req = { body: { email: 'a@b.com', password: 'pw', name: 'Alice' } } as Request;
    const res = makeRes();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  it('creates user and returns 201 with token when email is unique', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-pw' as never);
    const createdUser = { id: 'u1', email: 'a@b.com', name: 'Alice', familySize: 1, childrenAges: null, createdAt: new Date() };
    prismaMock.user.create.mockResolvedValue(createdUser);
    vi.mocked(jwt.sign).mockReturnValue('signed-token' as never);

    const req = { body: { email: 'a@b.com', password: 'pw', name: 'Alice' } } as Request;
    const res = makeRes();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ user: createdUser, token: 'signed-token' });
  });

  it('calls next(err) when prisma throws', async () => {
    const dbError = new Error('db error');
    prismaMock.user.findUnique.mockRejectedValue(dbError);
    const req = { body: { email: 'a@b.com', password: 'pw', name: 'Alice' } } as Request;
    const res = makeRes();

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});

describe('login()', () => {
  it('returns 401 when user is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const req = { body: { email: 'a@b.com', password: 'pw' } } as Request;
    const res = makeRes();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('returns 401 when password does not match', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', password: 'hashed' });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const req = { body: { email: 'a@b.com', password: 'wrong' } } as Request;
    const res = makeRes();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('returns user and token on successful login', async () => {
    const dbUser = { id: 'u1', email: 'a@b.com', name: 'Alice', familySize: 1, childrenAges: null, createdAt: new Date(), password: 'hashed' };
    prismaMock.user.findUnique.mockResolvedValue(dbUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue('signed-token' as never);

    const req = { body: { email: 'a@b.com', password: 'pw' } } as Request;
    const res = makeRes();

    await login(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'signed-token' }));
    const call = vi.mocked(res.json).mock.calls[0][0] as any;
    expect(call.user.id).toBe('u1');
    expect(call.user.password).toBeUndefined();
  });
});

describe('getProfile()', () => {
  it('returns 404 when user is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const req = { userId: 'u1' } as unknown as Request;
    const res = makeRes();

    await getProfile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('returns user profile when found', async () => {
    const profile = { id: 'u1', email: 'a@b.com', name: 'Alice', bio: null, profilePicture: null, familySize: 1, childrenAges: null, travelPreferences: null, availability: null, interests: null, createdAt: new Date() };
    prismaMock.user.findUnique.mockResolvedValue(profile);

    const req = { userId: 'u1' } as unknown as Request;
    const res = makeRes();

    await getProfile(req, res, next);

    expect(res.json).toHaveBeenCalledWith(profile);
  });
});

describe('updateProfile()', () => {
  it('returns the updated user profile', async () => {
    const updated = { id: 'u1', email: 'a@b.com', name: 'Alice Updated', bio: 'hi', profilePicture: null, familySize: 2, childrenAges: '5', travelPreferences: 'beach', availability: 'summer', createdAt: new Date() };
    prismaMock.user.update.mockResolvedValue(updated);

    const req = { userId: 'u1', body: { name: 'Alice Updated', familySize: 2 } } as unknown as Request;
    const res = makeRes();

    await updateProfile(req, res, next);

    expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'u1' } }));
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('calls next(err) when update throws', async () => {
    const dbError = new Error('update failed');
    prismaMock.user.update.mockRejectedValue(dbError);

    const req = { userId: 'u1', body: {} } as unknown as Request;
    const res = makeRes();

    await updateProfile(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});
