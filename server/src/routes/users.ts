import { Router } from 'express';
import { getUserProfile, uploadAvatar } from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import { avatarUpload } from '../middleware/upload.js';

const router = Router();

router.post('/me/avatar', auth, avatarUpload, uploadAvatar);
router.get('/:id', auth, getUserProfile);

export default router;
