import express from 'express';
import { createRecurringRide, getMyRecurringRides, toggleRecurringRide } from '../controllers/recurringRideController';
import { authenticate } from '../utils/authMiddleware';

const router = express.Router();

router.post('/', authenticate, createRecurringRide);
router.get('/my', authenticate, getMyRecurringRides);
router.patch('/:id/toggle', authenticate, toggleRecurringRide);

export default router;