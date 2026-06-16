import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  familySize: z.coerce.number().int().min(1).optional(),
  childrenAges: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1),
});

export const createTripSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  destination: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  groupType: z.string().min(1),
  activityPref: z.string().optional(),
  budget: z.coerce.number().nonnegative(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1),
  receiverId: z.string().min(1),
  tripId: z.string().optional(),
});

// Profile update is partial — every field is optional.
export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  familySize: z.coerce.number().int().min(1).optional(),
  childrenAges: z.string().optional(),
  travelPreferences: z.string().optional(),
  availability: z.string().optional(),
  profilePicture: z.string().optional(),
});
