import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../utils/authMiddleware';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const transactions = await Transaction.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ status: 'success', payload: transactions });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch transactions' });
  }
};

export const getBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId);
    res.json({ status: 'success', payload: { balance: user?.walletBalance || 0 } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch balance' });
  }
};

export const loadWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid amount' });
    }

    // Update user balance
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    );

    // Create transaction log
    await Transaction.create({
      userId,
      amount,
      type: 'credit',
      status: 'completed',
      description: 'Wallet top-up via UPI/Card'
    });

    res.json({ 
      status: 'success', 
      message: 'Wallet loaded successfully',
      payload: { balance: user?.walletBalance }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to load wallet' });
  }
};