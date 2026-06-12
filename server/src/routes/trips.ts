import { Router } from 'express';
import {
  getTrips,
  getTripById,
  createTrip,
  expressInterest,
  getTripInterests,
} from '../controllers/tripController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getTrips);
router.post('/', auth, createTrip);
router.get('/:id', auth, getTripById);
router.post('/:id/interest', auth, expressInterest);
router.get('/:id/interests', auth, getTripInterests);

export default router;
