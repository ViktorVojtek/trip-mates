import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../config/db.js', () => ({
  default: {
    trip: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    tripInterest: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import prisma from '../config/db.js';
import {
  getTrips,
  getTripById,
  createTrip,
  expressInterest,
  getTripInterests,
} from './tripController.js';

const prismaMock = prisma as unknown as {
  trip: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  tripInterest: {
    upsert: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
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

const tripRow = {
  id: 't1',
  title: 'Beach Trip',
  description: 'Fun',
  destination: 'Cancun',
  startDate: new Date('2026-07-01'),
  endDate: new Date('2026-07-10'),
  groupType: 'family',
  activityPref: 'relaxing',
  budget: 1500,
  createdById: 'u1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// getTrips
// ---------------------------------------------------------------------------
describe('getTrips()', () => {
  it('returns paginated trip list with serialized budget', async () => {
    prismaMock.trip.findMany.mockResolvedValue([tripRow]);
    prismaMock.trip.count.mockResolvedValue(1);

    const req = makeReq({ query: {} });
    const res = makeRes();
    await getTrips(req, res, next);

    const body = vi.mocked(res.json).mock.calls[0][0] as { results: typeof tripRow[]; meta: object };
    expect(body.results).toHaveLength(1);
    expect(body.results[0].budget).toBe(1500);
    expect(body.meta).toMatchObject({ page: 1, pageSize: 10, totalItems: 1, totalPages: 1 });
  });

  it('passes destination filter to prisma', async () => {
    prismaMock.trip.findMany.mockResolvedValue([]);
    prismaMock.trip.count.mockResolvedValue(0);

    const req = makeReq({ query: { destination: 'Paris' } });
    const res = makeRes();
    await getTrips(req, res, next);

    expect(prismaMock.trip.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ destination: expect.anything() }) })
    );
  });

  it('calls next(err) on prisma error', async () => {
    const err = new Error('db fail');
    prismaMock.trip.findMany.mockRejectedValue(err);
    prismaMock.trip.count.mockRejectedValue(err);

    const req = makeReq();
    const res = makeRes();
    await getTrips(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});

// ---------------------------------------------------------------------------
// getTripById
// ---------------------------------------------------------------------------
describe('getTripById()', () => {
  it('returns the trip when found', async () => {
    prismaMock.trip.findUnique.mockResolvedValue(tripRow);

    const req = makeReq({ params: { id: 't1' } });
    const res = makeRes();
    await getTripById(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 't1', budget: 1500 }));
  });

  it('returns 404 when not found', async () => {
    prismaMock.trip.findUnique.mockResolvedValue(null);

    const req = makeReq({ params: { id: 'missing' } });
    const res = makeRes();
    await getTripById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Trip not found' });
  });

  it('calls next(err) on prisma error', async () => {
    const err = new Error('db fail');
    prismaMock.trip.findUnique.mockRejectedValue(err);

    const req = makeReq({ params: { id: 't1' } });
    const res = makeRes();
    await getTripById(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});

// ---------------------------------------------------------------------------
// createTrip
// ---------------------------------------------------------------------------
describe('createTrip()', () => {
  it('creates and returns the trip with 201', async () => {
    prismaMock.trip.create.mockResolvedValue(tripRow);

    const req = makeReq({
      body: {
        title: 'Beach Trip',
        description: 'Fun',
        destination: 'Cancun',
        startDate: '2026-07-01',
        endDate: '2026-07-10',
        groupType: 'family',
        activityPref: 'relaxing',
        budget: 1500,
      },
    });
    const res = makeRes();
    await createTrip(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }));
  });

  it('calls next(err) on prisma error', async () => {
    const err = new Error('db fail');
    prismaMock.trip.create.mockRejectedValue(err);

    const req = makeReq({ body: { startDate: '2026-07-01', endDate: '2026-07-10' } });
    const res = makeRes();
    await createTrip(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});

// ---------------------------------------------------------------------------
// expressInterest
// ---------------------------------------------------------------------------
describe('expressInterest()', () => {
  it('returns 404 when the trip does not exist', async () => {
    prismaMock.trip.findUnique.mockResolvedValue(null);

    const req = makeReq({ params: { id: 'missing' } });
    const res = makeRes();
    await expressInterest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Trip not found' });
  });

  it('upserts and returns the interest with status pending', async () => {
    prismaMock.trip.findUnique.mockResolvedValue({ id: 't1' });
    const interest = { id: 'i1', tripId: 't1', userId: 'u1', createdAt: new Date() };
    prismaMock.tripInterest.upsert.mockResolvedValue(interest);

    const req = makeReq({ params: { id: 't1' } });
    const res = makeRes();
    await expressInterest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending', tripId: 't1' }));
  });

  it('calls next(err) on prisma error', async () => {
    const err = new Error('db fail');
    prismaMock.trip.findUnique.mockRejectedValue(err);

    const req = makeReq({ params: { id: 't1' } });
    const res = makeRes();
    await expressInterest(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});

// ---------------------------------------------------------------------------
// getTripInterests
// ---------------------------------------------------------------------------
describe('getTripInterests()', () => {
  it('returns interests with status pending', async () => {
    const interests = [
      { id: 'i1', tripId: 't1', userId: 'u1', createdAt: new Date(), user: { id: 'u1', name: 'Alice', bio: null, profilePicture: null, familySize: 2 } },
    ];
    prismaMock.tripInterest.findMany.mockResolvedValue(interests);

    const req = makeReq({ params: { id: 't1' } });
    const res = makeRes();
    await getTripInterests(req, res, next);

    const body = vi.mocked(res.json).mock.calls[0][0] as Array<{ status: string }>;
    expect(body).toHaveLength(1);
    expect(body[0].status).toBe('pending');
  });

  it('calls next(err) on prisma error', async () => {
    const err = new Error('db fail');
    prismaMock.tripInterest.findMany.mockRejectedValue(err);

    const req = makeReq({ params: { id: 't1' } });
    const res = makeRes();
    await getTripInterests(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
