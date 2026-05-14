import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthRequest } from '../utils/authMiddleware';
import { Ride } from '../models/Ride';
import { calculateDistance } from '../utils/haversine';
import { getRoadDistance, getRoutePoints } from '../utils/routing';
import { GlobalSettings } from '../models/GlobalSettings';

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let rides;
    if (role === 'student' || role === 'admin') {
      rides = await Ride.find({ riders: userId }).sort({ createdAt: -1 }).populate('host riders', 'name pseudonym isAnonymous');
    } else {
      rides = await Ride.find({ host: userId }).sort({ createdAt: -1 }).populate('riders', 'name pseudonym isAnonymous');
    }

    res.json(rides);
  } catch (error: any) {
    console.error('Ride History 500 Error:', error);
    res.status(500).json({ 
      message: 'Error fetching ride history', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const estimateFare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pickupLocation, dropoffLocation } = req.body;
    
    if (!pickupLocation || !dropoffLocation) {
      res.status(400).json({ message: 'Missing locations' });
      return;
    }

    const distance = await getRoadDistance(
      pickupLocation.lat,
      pickupLocation.lng,
      dropoffLocation.lat,
      dropoffLocation.lng
    );

    // Fetch dynamic rates from settings
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = await GlobalSettings.create({});
    }

    const fare = Number((settings.baseFare + distance * settings.pricePerKm).toFixed(2));

    res.json({ distance, fare });
  } catch (error) {
    res.status(500).json({ message: 'Error estimating fare', error });
  }
};

export const getRideById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ride = await Ride.findById(id).populate('riders host', 'name email role pseudonym isAnonymous');
    
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
    const { pickupLat, pickupLng, dropoffLat, dropoffLng, date } = req.query;

    const query: any = {
      isPublic: true,
      status: { $in: ['pending', 'accepted'] },
    };

    if (date) {
      const searchDate = new Date(date as string);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      query.departureTime = { $gte: startOfDay, $lte: endOfDay };
    }

    // Find public rides that are pending or accepted
    const rides = await Ride.find(query).populate('riders', '_id name pseudonym isAnonymous');

    const userId = req.user.userId;

    // Filter out rides where the current user is already a rider
    const availableRidesList = rides.filter(ride => 
      ride.riders.length < ride.maxRiders && 
      !ride.riders.some((r: any) => {
        if (!r) return false;
        const rId = r._id ? r._id.toString() : r.toString();
        return rId === userId;
      })
    );

    // If no search parameters, return the filtered list
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      res.json(availableRidesList);
      return;
    }

    const pLat = Number(pickupLat);
    const pLng = Number(pickupLng);
    const dLat = Number(dropoffLat);
    const dLng = Number(dropoffLng);

    // Filter rides using Detour Heuristic
    const finalRides = [];
    for (const ride of availableRidesList) {
      const rStartLat = ride.pickupLocation.coordinates[1];
      const rStartLng = ride.pickupLocation.coordinates[0];
      const rEndLat = ride.dropoffLocation.coordinates[1];
      const rEndLng = ride.dropoffLocation.coordinates[0];

      const [d1, d2, d3, dTotal] = await Promise.all([
        getRoadDistance(rStartLat, rStartLng, pLat, pLng),
        getRoadDistance(pLat, pLng, dLat, dLng),
        getRoadDistance(dLat, dLng, rEndLat, rEndLng),
        getRoadDistance(rStartLat, rStartLng, rEndLat, rEndLng)
      ]);

      const detour = (d1 + d2 + d3) - dTotal;
      
      if (detour < 1.5 || detour < (dTotal * 0.2)) {
        finalRides.push(ride);
      }
    }
    
    res.json(finalRides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available rides', error });
  }
};

export const joinRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rideId, pickupLocation, dropoffLocation } = req.body;
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

    const userObjId = new mongoose.Types.ObjectId(userId as string);
    ride.riders.push(userObjId as any);
    
    // Add rider segment for distance-based pricing
    ride.riderSegments.push({
      userId: userObjId as any,
      pickupLocation: pickupLocation ? {
        type: 'Point',
        coordinates: [pickupLocation.lng, pickupLocation.lat],
        address: pickupLocation.address
      } : ride.pickupLocation,
      dropoffLocation: dropoffLocation ? {
        type: 'Point',
        coordinates: [dropoffLocation.lng, dropoffLocation.lat],
        address: dropoffLocation.address
      } : ride.dropoffLocation,
      distance: 0 // Will be calculated on completion
    });

    await ride.save();

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Error joining ride', error });
  }
};

export const deleteRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const ride = await Ride.findById(id);
    
    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }

    // Only organizer or admin can delete
    const organizerId = ride.riders[0].toString();
    if (organizerId !== userId && role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to delete this ride' });
      return;
    }

    // If ride is ongoing, maybe prevent deletion?
    // For now, let's allow it but maybe warn. 
    // Usually ongoing rides should be 'cancelled' not deleted for audit, 
    // but the request is specifically for "delete".
    
    await Ride.findByIdAndDelete(id);
    
    res.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ride', error });
  }
};

export const leaveRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rideId } = req.body;
    const userId = req.user.userId;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }

    if (ride.status !== 'pending' && ride.status !== 'accepted') {
      res.status(400).json({ message: 'Cannot leave ride once it has started' });
      return;
    }

    // Check if user is organizer
    const organizerId = ride.riders[0].toString();
    if (organizerId === userId) {
      res.status(400).json({ message: 'Organizer cannot leave. Please delete the ride instead.' });
      return;
    }

    // Remove user from riders and segments
    ride.riders = ride.riders.filter(r => r.toString() !== userId);
    ride.riderSegments = ride.riderSegments.filter(s => s.userId.toString() !== userId);

    await ride.save();
    res.json({ message: 'Left ride successfully', ride });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving ride', error });
  }
};

export const getRoute = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;
    if (!startLat || !startLng || !endLat || !endLng) {
      res.status(400).json({ message: 'Missing coordinates' });
      return;
    }

    const points = await getRoutePoints(
      Number(startLat),
      Number(startLng),
      Number(endLat),
      Number(endLng)
    );

    res.json(points);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching route points', error });
  }
};
