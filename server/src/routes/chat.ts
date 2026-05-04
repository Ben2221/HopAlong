import express from 'express';
import { getChatHistory } from '../controllers/chatController';
import { authenticate } from '../utils/authMiddleware';

const router = express.Router();

router.get('/:rideId', authenticate, getChatHistory);

export default router;
