import { Request, Response } from 'express';
import { User } from '../models/User';
import { Ride } from '../models/Ride';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRides = await Ride.countDocuments();
    const activeRides = await Ride.countDocuments({ status: { $in: ['accepted', 'ongoing'] } });
    
    // Calculate total revenue (sum of all completed ride fares)
    const completedRides = await Ride.find({ status: 'completed' });
    const totalRevenue = completedRides.reduce((sum, ride) => sum + (ride.fare || 0), 0);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalRides,
        activeRides,
        totalRevenue
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: users });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAllRides = async (req: Request, res: Response) => {
  try {
    const rides = await Ride.find()
      .populate('riders', 'name pseudonym email')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: rides });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === (req as any).user.userId) {
      res.status(400).json({ status: 'error', message: 'You cannot delete your own admin account.' });
      return;
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (id === (req as any).user.userId) {
      res.status(400).json({ status: 'error', message: 'You cannot change your own status.' });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({ status: 'success', data: user });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateUserWallet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, action } = req.body; // action: 'add' | 'set'
    
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    if (action === 'set') {
      user.walletBalance = amount;
    } else {
      user.walletBalance += amount;
    }

    await user.save();
    res.status(200).json({ status: 'success', data: user });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

import { GlobalSettings } from '../models/GlobalSettings';

export const getGlobalSettings = async (req: Request, res: Response) => {
  try {
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = await GlobalSettings.create({});
    }
    res.status(200).json({ status: 'success', data: settings });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateGlobalSettings = async (req: Request, res: Response) => {
  try {
    const settings = await GlobalSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.status(200).json({ status: 'success', data: settings });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

import { Contact } from '../models/Contact';

export const getContactMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: messages });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateContactStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const message = await Contact.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({ status: 'success', data: message });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    res.status(200).json({ status: 'success', data: user });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const cancelRideAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await Ride.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
    res.status(200).json({ status: 'success', message: 'Ride cancelled by admin', data: ride });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const completedRides = await Ride.find({ status: 'completed' });
    
    // Revenue Trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRides = await Ride.find({ 
      status: 'completed', 
      createdAt: { $gte: sevenDaysAgo } 
    }).sort({ createdAt: 1 });

    const dailyRevenue = recentRides.reduce((acc: any, ride) => {
      const day = new Date(ride.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      acc[day] = (acc[day] || 0) + (ride.fare || 0);
      return acc;
    }, {});

    // ESG / Sustainability Metrics
    const totalDistance = completedRides.reduce((sum, ride) => sum + 10, 0); // Approximation if distance not stored
    const co2Saved = totalDistance * 0.2; // 0.2kg CO2 per km saved
    const moneySaved = completedRides.length * 50; // Heuristic

    res.status(200).json({
      status: 'success',
      data: {
        revenueData: Object.entries(dailyRevenue).map(([name, value]) => ({ name, value })),
        sustainability: {
          co2Saved,
          moneySaved,
          totalDistance
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
