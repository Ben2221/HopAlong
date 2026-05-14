import express from 'express';
import { getHistory, estimateFare, getRideById, getAvailableRides, joinRide, deleteRide, leaveRide, getRoute } from '../controllers/rideController';
import { authenticate } from '../utils/authMiddleware';

const router = express.Router();

router.get('/history', authenticate, getHistory);
router.get('/route', authenticate, getRoute);
router.post('/estimate', authenticate, estimateFare);
router.get('/available', authenticate, getAvailableRides);
router.post('/join', authenticate, joinRide);
router.post('/leave', authenticate, leaveRide);
router.get('/:id', authenticate, getRideById);
router.delete('/:id', authenticate, deleteRide);

export default router;
