import express from 'express';
import { getAdminStats, getAllUsers, getAllRides, deleteUser } from '../controllers/adminController';
import { authenticate } from '../utils/authMiddleware';
import { adminOnly } from '../utils/adminMiddleware';

const router = express.Router();

// All admin routes require both authentication AND admin privileges
router.use(authenticate);
router.use(adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/rides', getAllRides);

export default router;
