import express from 'express';
import { createAlert, getMyAlerts, deleteAlert } from '../controllers/notificationController';
import { authenticate } from '../utils/authMiddleware';

const router = express.Router();

router.post('/alerts', authenticate, createAlert);
router.get('/alerts', authenticate, getMyAlerts);
router.delete('/alerts/:id', authenticate, deleteAlert);

export default router;