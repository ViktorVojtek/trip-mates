import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/db.js';

const messageSelect = {
  id: true,
  content: true,
  tripId: true,
  senderId: true,
  receiverId: true,
  createdAt: true,
} as const;

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tripId, userId } = req.query;
    const currentUserId = req.userId!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let where: Record<string, any>;

    if (tripId) {
      where = { tripId: tripId as string };
    } else if (userId) {
      where = {
        OR: [
          { senderId: currentUserId, receiverId: userId as string },
          { senderId: userId as string, receiverId: currentUserId },
        ],
      };
    } else {
      where = {
        OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
      };
    }

    const messages = await prisma.message.findMany({
      where,
      select: messageSelect,
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content, receiverId, tripId } = req.body;
    const senderId = req.userId!;

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        tripId: tripId || null,
      },
      select: messageSelect,
    });

    // Push the new message in real time to both participants' rooms.
    // io is absent in unit tests / non-socket contexts — emit only when present.
    const io = req.app?.get?.('io');
    if (io) {
      io.to(receiverId).emit('message:new', message);
      if (senderId !== receiverId) io.to(senderId).emit('message:new', message);
    }

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};
