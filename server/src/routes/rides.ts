import express from 'express';
import { getHistory, estimateFare, getRideById, getAvailableRides, joinRide } from '../controllers/rideController';
import { authenticate } from '../utils/authMiddleware';

const router = express.Router();

router.get('/history', authenticate, getHistory);
router.post('/estimate', authenticate, estimateFare);
router.get('/available', authenticate, getAvailableRides);
router.post('/join', authenticate, joinRide);
router.get('/:id', authenticate, getRideById);

export default router;
