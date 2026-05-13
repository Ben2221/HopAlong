import { Response } from 'express';
import { AuthRequest } from '../utils/authMiddleware';
import { RecurringRide } from '../models/RecurringRide';
import { Ride } from '../models/Ride';
import mongoose from 'mongoose';

export const createRecurringRide = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const rideData = { ...req.body, userId };
    
    const recurringRide = new RecurringRide(rideData);
    await recurringRide.save();
    
    res.json({ status: 'success', payload: recurringRide });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create recurring ride' });
  }
};

export const getMyRecurringRides = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const rides = await RecurringRide.find({ userId });
    res.json({ status: 'success', payload: rides });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch recurring rides' });
  }
};

export const toggleRecurringRide = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await RecurringRide.findById(id);
    if (!ride) return res.status(404).json({ status: 'error', message: 'Not found' });
    
    ride.isActive = !ride.isActive;
    await ride.save();
    
    res.json({ status: 'success', payload: ride });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to toggle status' });
  }
};

// This would typically be called by a cron job
export const triggerAutoRides = async () => {
  const today = new Date().toLocaleString('en-us', { weekday: 'long' });
  const activeTemplates = await RecurringRide.find({ isActive: true, daysOfWeek: today });
  
  for (const template of activeTemplates) {
    // Create a real ride for today based on template
    // Logic to prevent duplicates for today would go here
    const newRide = new Ride({
      driver: template.userId,
      riders: [],
      pickupLocation: template.pickupLocation,
      dropoffLocation: template.dropoffLocation,
      fare: template.estimatedCostPerHead, // simplification
      status: 'pending',
      departureTime: new Date(), // Set to today at template.departureTime
      description: `[Auto] ${template.description || 'Recurring Commute'}`,
      maxRiders: 4
    });
    await newRide.save();
  }
};