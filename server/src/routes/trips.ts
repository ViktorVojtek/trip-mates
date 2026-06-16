import { Router } from 'express';
import {
  getTrips,
  getTripById,
  createTrip,
  expressInterest,
  getTripInterests,
} from '../controllers/tripController.js';
import auth from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTripSchema } from '../validation/schemas.js';

const router = Router();

// Public discovery: visitors can browse trips before signing up.
router.get('/', getTrips);
router.get('/:id', getTripById);
// Mutations and interest data stay authenticated.
router.post('/', auth, validate(createTripSchema), createTrip);
router.post('/:id/interest', auth, expressInterest);
router.get('/:id/interests', auth, getTripInterests);

export default router;
