import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import type { RegisterRequestBody, LoginRequestBody, UpdateProfileRequestBody } from '../types/index.js';

const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name, familySize = 1, childrenAges = '' } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        familySize,
        childrenAges: childrenAges || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        familySize: true,
        childrenAges: true,
        createdAt: true,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        familySize: user.familySize,
        childrenAges: user.childrenAges,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        profilePicture: true,
        familySize: true,
        childrenAges: true,
        travelPreferences: true,
        availability: true,
        interests: true,
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

const updateProfile = async (
  req: Request<{}, {}, UpdateProfileRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, bio, familySize, childrenAges, travelPreferences, availability, profilePicture } =
      req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId! },
      data: { name, bio, familySize, childrenAges, travelPreferences, availability, profilePicture },
      select: {
        id: true,
        email: true,
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

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export { register, login, getProfile, updateProfile };
