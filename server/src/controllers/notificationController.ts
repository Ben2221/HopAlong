import { Response } from 'express';
import { AuthRequest } from '../utils/authMiddleware';
import mongoose from 'mongoose';

// Defined inline as in the log snippet
const RouteAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
    address: String
  },
  dropoffLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
    address: String
  },
  radius: { type: Number, default: 2000 } // 2km radius
}, { timestamps: true });

RouteAlertSchema.index({ pickupLocation: '2dsphere' });
RouteAlertSchema.index({ dropoffLocation: '2dsphere' });

const RouteAlert = mongoose.model('RouteAlert', RouteAlertSchema);

export const createAlert = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const alert = new RouteAlert({ ...req.body, userId });
    await alert.save();
    res.json({ status: 'success', payload: alert });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create alert' });
  }
};

export const getMyAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const alerts = await RouteAlert.find({ userId });
    res.json({ status: 'success', payload: alerts });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch alerts' });
  }
};

export const deleteAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await RouteAlert.findByIdAndDelete(id);
    res.json({ status: 'success', message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete alert' });
  }
};