import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/db.js';

const tripSelect = {
  id: true,
  title: true,
  description: true,
  destination: true,
  startDate: true,
  endDate: true,
  groupType: true,
  activityPref: true,
  budget: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Prisma returns Decimal for budget; convert to number for JSON serialization
const serializeTrip = (trip: { budget: { toString(): string } & object } & Record<string, unknown>) => ({
  ...trip,
  budget: Number(trip.budget),
});

export const getTrips = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { destination, groupType, startDate, endDate } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 10));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};
    if (destination) where['destination'] = { contains: destination as string, mode: 'insensitive' };
    if (groupType) where['groupType'] = groupType as string;
    if (startDate) where['startDate'] = { gte: new Date(startDate as string) };
    if (endDate) where['endDate'] = { lte: new Date(endDate as string) };

    const [trips, totalItems] = await Promise.all([
      prisma.trip.findMany({
        where,
        select: tripSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.trip.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      results: trips.map(serializeTrip),
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTripById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      select: tripSelect,
    });

    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    res.json(serializeTrip(trip));
  } catch (err) {
    next(err);
  }
};

export const createTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, destination, startDate, endDate, groupType, activityPref, budget } =
      req.body;

    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        destination,
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        groupType,
        activityPref: activityPref || null,
        budget,
        createdById: req.userId!,
      },
      select: tripSelect,
    });

    res.status(201).json(serializeTrip(trip));
  } catch (err) {
    next(err);
  }
};

export const expressInterest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tripId = req.params.id;
    const userId = req.userId!;

    const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { id: true } });
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    const interest = await prisma.tripInterest.upsert({
      where: { userId_tripId: { userId, tripId } },
      create: { userId, tripId },
      update: {},
      select: { id: true, tripId: true, userId: true, createdAt: true },
    });

    res.status(201).json({ ...interest, status: 'pending' });
  } catch (err) {
    next(err);
  }
};

export const getTripInterests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const interests = await prisma.tripInterest.findMany({
      where: { tripId: req.params.id },
      select: {
        id: true,
        tripId: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            bio: true,
            profilePicture: true,
            familySize: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(interests.map((i) => ({ ...i, status: 'pending' })));
  } catch (err) {
    next(err);
  }
};
