import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { sendEmail, getPasswordResetTemplate } from '../utils/emailService';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const adjectives = ['Swift', 'Electric', 'Silver', 'Cool', 'Urban', 'Wild', 'Neon', 'Golden'];
    const animals = ['Cheetah', 'Falcon', 'Raven', 'Panda', 'Shark', 'Wolf', 'Tiger', 'Lynx'];
    const randomPseudonym = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${animals[Math.floor(Math.random() * animals.length)]}${Math.floor(Math.random() * 100)}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      pseudonym: randomPseudonym
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        pseudonym: user.pseudonym,
        isAnonymous: user.isAnonymous,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    if (!user.password) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ 
        message: `Your account has been ${user.status}. Please contact support.` 
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Admin Promotion Logic: Automatically promote specific user to admin
    if (user.email === 'bensavio2221@gmail.com' && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        pseudonym: user.pseudonym,
        isAnonymous: user.isAnonymous,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'No student account found with this email' });
      return;
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and set to user record
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiry (1 hour)
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    // Create reset URL
    const resetUrl = `${req.get('origin')}/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'HopAlong Password Reset Request',
        message: `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a put request to: \n\n ${resetUrl}`,
        html: getPasswordResetTemplate(resetUrl)
      });

      res.status(200).json({
        message: 'Password reset link sent to email',
        // In development, we return the link directly for convenience
        ...(process.env.NODE_ENV !== 'production' && { dev_reset_url: resetUrl })
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.error('Email could not be sent:', emailError);
      res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Hash the token from URL to match the one in DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired password reset token' });
      return;
    }

    // Set new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};
