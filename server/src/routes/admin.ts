import express from 'express';
import { 
  getAdminStats, 
  getAllUsers, 
  getAllRides, 
  deleteUser, 
  updateUserStatus, 
  updateUserWallet, 
  getGlobalSettings, 
  updateGlobalSettings,
  getContactMessages,
  updateContactStatus
} from '../controllers/adminController';
import { authenticate } from '../utils/authMiddleware';
import { adminOnly } from '../utils/adminMiddleware';

const router = express.Router();

// All admin routes require both authentication AND admin privileges
router.use(authenticate);
router.use(adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', updateUserStatus);
router.post('/users/:id/wallet', updateUserWallet);
router.get('/rides', getAllRides);
router.get('/settings', getGlobalSettings);
router.patch('/settings', updateGlobalSettings);

export default router;

router.get('/messages', getContactMessages);
router.patch('/messages/:id', updateContactStatus);

router.patch('/users/:id/role', updateUserRole);
router.delete('/rides/:id', cancelRideAdmin);
