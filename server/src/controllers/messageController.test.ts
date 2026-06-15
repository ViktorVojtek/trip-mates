import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../config/db.js', () => ({
  default: {
    message: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import prisma from '../config/db.js';
import { getMessages, sendMessage } from './messageController.js';

const prismaMock = prisma as unknown as {
  message: {
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
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

const msgRow = {
  id: 'm1',
  content: 'Hello',
  tripId: null,
  senderId: 'u1',
  receiverId: 'u2',
  createdAt: new Date(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// getMessages
// ---------------------------------------------------------------------------
describe('getMessages()', () => {
  it('filters by tripId when provided', async () => {
    prismaMock.message.findMany.mockResolvedValue([msgRow]);

    const req = makeReq({ query: { tripId: 't1' } });
    const res = makeRes();
    await getMessages(req, res, next);

    expect(prismaMock.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tripId: 't1' } })
    );
    expect(res.json).toHaveBeenCalledWith([msgRow]);
  });

  it('filters by partner userId when provided', async () => {
    prismaMock.message.findMany.mockResolvedValue([msgRow]);

    const req = makeReq({ query: { userId: 'u2' } });
    const res = makeRes();
    await getMessages(req, res, next);

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

  it('returns all messages for current user when no filter is given', async () => {
    prismaMock.message.findMany.mockResolvedValue([msgRow]);

    const req = makeReq({ query: {} });
    const res = makeRes();
    await getMessages(req, res, next);

    expect(prismaMock.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ senderId: 'u1' }, { receiverId: 'u1' }] },
      })
    );
  });

  it('calls next(err) on prisma error', async () => {
    const err = new Error('db fail');
    prismaMock.message.findMany.mockRejectedValue(err);

    const req = makeReq();
    const res = makeRes();
    await getMessages(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});

// ---------------------------------------------------------------------------
// sendMessage
// ---------------------------------------------------------------------------
describe('sendMessage()', () => {
  it('creates and returns the message with 201', async () => {
    prismaMock.message.create.mockResolvedValue(msgRow);

    const req = makeReq({ body: { content: 'Hello', receiverId: 'u2' } });
    const res = makeRes();
    await sendMessage(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(msgRow);
    expect(prismaMock.message.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ senderId: 'u1', receiverId: 'u2' }) })
    );
  });

  it('passes tripId as null when not provided', async () => {
    prismaMock.message.create.mockResolvedValue({ ...msgRow, tripId: null });

    const req = makeReq({ body: { content: 'Hello', receiverId: 'u2' } });
    const res = makeRes();
    await sendMessage(req, res, next);

    expect(prismaMock.message.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tripId: null }) })
    );
  });

  it('calls next(err) on prisma error', async () => {
    const err = new Error('db fail');
    prismaMock.message.create.mockRejectedValue(err);

    const req = makeReq({ body: { content: 'Hi', receiverId: 'u2' } });
    const res = makeRes();
    await sendMessage(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
