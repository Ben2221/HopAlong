import express from 'express';
import { getProfile, updatePrivacy, updateWallet } from '../controllers/userController';
import { authenticate } from '../utils/authMiddleware';

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.put('/privacy', authenticate, updatePrivacy);
router.post('/wallet/add', authenticate, updateWallet);
router.patch('/push-token', authenticate, async (req: any, res: any) => {
  try {
    const { pushToken } = req.body;
    const { User } = await import('../models/User');
    await User.findByIdAndUpdate(req.user.userId, { pushToken });
    res.json({ message: 'Push token updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating push token', error });
  }
});

export default router;
