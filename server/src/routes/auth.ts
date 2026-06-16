import { Router } from 'express';
import { register, login, getProfile, updateProfile, googleAuth } from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createAuthLimiter } from '../middleware/rateLimit.js';
import { registerSchema, loginSchema, googleAuthSchema, updateProfileSchema } from '../validation/schemas.js';

const router = Router();
const authLimiter = createAuthLimiter();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, validate(googleAuthSchema), googleAuth);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, validate(updateProfileSchema), updateProfile);

export default router;
