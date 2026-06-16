import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import auth from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendMessageSchema } from '../validation/schemas.js';

const router = Router();

router.get('/', auth, getMessages);
router.post('/', auth, validate(sendMessageSchema), sendMessage);

export default router;
