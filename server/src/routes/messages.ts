import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getMessages);
router.post('/', auth, sendMessage);

export default router;
