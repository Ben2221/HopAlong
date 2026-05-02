import express from 'express';
import { getProfile, updatePrivacy, updateWallet } from '../controllers/userController';
import { authenticate } from '../utils/authMiddleware';

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.put('/privacy', authenticate, updatePrivacy);
router.post('/wallet/add', authenticate, updateWallet);

export default router;
