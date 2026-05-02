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
