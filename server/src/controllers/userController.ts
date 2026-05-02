import { Response } from 'express';
import { AuthRequest } from '../utils/authMiddleware';
import { User } from '../models/User';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

export const updatePrivacy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isAnonymous } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { isAnonymous },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating privacy settings', error });
  }
};

export const updateWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    user.walletBalance += amount;
    await user.save();
    res.json({ walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: 'Error updating wallet', error });
  }
};
