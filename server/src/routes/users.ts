import { Router } from 'express';
import { getUserProfile } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/:id', auth, getUserProfile);

export default router;
