import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/db.js';

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        bio: true,
        profilePicture: true,
        familySize: true,
        childrenAges: true,
        travelPreferences: true,
        availability: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};
