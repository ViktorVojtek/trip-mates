import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../config/db.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import prisma from '../config/db.js';
import { getUserProfile } from './userController.js';

const prismaMock = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

function makeRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

function makeReq(overrides: Partial<Request> = {}): Request {
  return { query: {}, params: {}, body: {}, userId: 'u1', ...overrides } as unknown as Request;
}

const next = vi.fn() as unknown as NextFunction;

const publicProfile = {
  id: 'u2',
  name: 'Bob',
  bio: 'Traveler',
  profilePicture: null,
  familySize: 3,
  childrenAges: '5,8',
  travelPreferences: 'adventure',
  availability: '2026-07-01',
  createdAt: new Date(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getUserProfile()', () => {
  it('returns the public user profile when found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(publicProfile);

    const req = makeReq({ params: { id: 'u2' } });
    const res = makeRes();
    await getUserProfile(req, res, next);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'u2' } })
    );
    expect(res.json).toHaveBeenCalledWith(publicProfile);
  });

  it('returns 404 when the user is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = makeReq({ params: { id: 'missing' } });
    const res = makeRes();
    await getUserProfile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('calls next(err) on prisma error', async () => {
    const err = new Error('db fail');
    prismaMock.user.findUnique.mockRejectedValue(err);

    const req = makeReq({ params: { id: 'u2' } });
    const res = makeRes();
    await getUserProfile(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
