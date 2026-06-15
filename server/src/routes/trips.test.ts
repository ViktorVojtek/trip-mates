import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

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

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

import prisma from '../config/db.js';
import jwt from 'jsonwebtoken';
import tripsRouter from './trips.js';
import errorHandler from '../middleware/errorHandler.js';

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

const app = express();
app.use(express.json());
app.use('/api/trips', tripsRouter);
app.use(errorHandler);

const tripRow = {
  id: 't1',
  title: 'Beach Trip',
  description: 'Fun',
  destination: 'Cancun',
  startDate: new Date('2026-07-01').toISOString(),
  endDate: new Date('2026-07-10').toISOString(),
  groupType: 'family',
  activityPref: 'relaxing',
  budget: 1500,
  createdById: 'u1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.resetAllMocks();
  process.env.JWT_SECRET = 'test-secret';
  vi.mocked(jwt.verify).mockReturnValue({ userId: 'u1' } as never);
});

describe('GET /api/trips', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/trips');
    expect(res.status).toBe(401);
  });

  it('returns paginated trips for authenticated user', async () => {
    prismaMock.trip.findMany.mockResolvedValue([tripRow]);
    prismaMock.trip.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/trips')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0].id).toBe('t1');
    expect(res.body.meta.totalItems).toBe(1);
  });
});

describe('GET /api/trips/:id', () => {
  it('returns 404 when trip does not exist', async () => {
    prismaMock.trip.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/trips/missing')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Trip not found' });
  });

  it('returns the trip when found', async () => {
    prismaMock.trip.findUnique.mockResolvedValue(tripRow);

    const res = await request(app)
      .get('/api/trips/t1')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('t1');
    expect(res.body.budget).toBe(1500);
  });
});

describe('POST /api/trips', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/trips').send({});
    expect(res.status).toBe(401);
  });

  it('creates and returns the trip with 201', async () => {
    prismaMock.trip.create.mockResolvedValue(tripRow);

    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', 'Bearer valid-token')
      .send({
        title: 'Beach Trip',
        description: 'Fun',
        destination: 'Cancun',
        startDate: '2026-07-01',
        endDate: '2026-07-10',
        groupType: 'family',
        budget: 1500,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('t1');
  });
});

describe('POST /api/trips/:id/interest', () => {
  it('returns 404 when trip does not exist', async () => {
    prismaMock.trip.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/trips/missing/interest')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(404);
  });

  it('returns 201 with status pending on success', async () => {
    prismaMock.trip.findUnique.mockResolvedValue({ id: 't1' });
    prismaMock.tripInterest.upsert.mockResolvedValue({
      id: 'i1', tripId: 't1', userId: 'u1', createdAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post('/api/trips/t1/interest')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
  });
});

describe('GET /api/trips/:id/interests', () => {
  it('returns list of interests with status pending', async () => {
    prismaMock.tripInterest.findMany.mockResolvedValue([
      { id: 'i1', tripId: 't1', userId: 'u1', createdAt: new Date().toISOString(), user: { id: 'u1', name: 'Alice', bio: null, profilePicture: null, familySize: 2 } },
    ]);

    const res = await request(app)
      .get('/api/trips/t1/interests')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body[0].status).toBe('pending');
  });
});
