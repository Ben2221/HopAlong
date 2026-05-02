import { Response } from 'express';
import { AuthRequest } from '../utils/authMiddleware';
import { Ride } from '../models/Ride';
import { calculateDistance, calculateFare } from '../utils/haversine';

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let rides;
    if (role === 'rider') {
      rides = await Ride.find({ riders: userId }).sort({ createdAt: -1 }).populate('driver riders', 'name pseudonym isAnonymous');
    } else {
      rides = await Ride.find({ driver: userId }).sort({ createdAt: -1 }).populate('riders', 'name pseudonym isAnonymous');
    }

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ride history', error });
  }
};

export const estimateFare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pickupLocation, dropoffLocation } = req.body;
    
    if (!pickupLocation || !dropoffLocation) {
      res.status(400).json({ message: 'Missing locations' });
      return;
    }

    const distance = calculateDistance(
      pickupLocation.lat,
      pickupLocation.lng,
      dropoffLocation.lat,
      dropoffLocation.lng
    );

    const fare = calculateFare(distance);

    res.json({ distance, fare });
  } catch (error) {
    res.status(500).json({ message: 'Error estimating fare', error });
  }
};

export const getRideById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ride = await Ride.findById(id).populate('riders driver', 'name email role pseudonym isAnonymous');
    
    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ride', error });
  }
};

export const getAvailableRides = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find public rides that are pending or accepted but not full
    const rides = await Ride.find({
      isPublic: true,
      status: { $in: ['pending', 'accepted'] },
    }).populate('riders', 'name pseudonym isAnonymous');

    // Filter out rides that are already full
    const availableRides = rides.filter(ride => ride.riders.length < ride.maxRiders);
    
    res.json(availableRides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available rides', error });
  }
};

export const joinRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rideId } = req.body;
    const userId = req.user.userId;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }

    if (ride.riders.includes(userId as any)) {
      res.status(400).json({ message: 'Already in this ride' });
      return;
    }

    if (ride.riders.length >= ride.maxRiders) {
      res.status(400).json({ message: 'Ride is full' });
      return;
    }

    ride.riders.push(userId as any);
    await ride.save();

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Error joining ride', error });
  }
};
