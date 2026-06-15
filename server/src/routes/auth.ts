import { Router } from 'express';
import { register, login, getProfile, updateProfile, googleAuth } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

export default router;
