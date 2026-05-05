import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Ride } from '../models/Ride';
import { Message } from '../models/Message';
import { calculateDistance } from '../utils/haversine';
import { getRoadDistance } from '../utils/routing';

// Store connected users: socketId -> userId
const connectedUsers = new Map<string, string>();
// Store drivers current location in memory for fast lookup
// In a real app, this might be in Redis
const driversLocation = new Map<string, { lat: number, lng: number }>();

export const setupSocket = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.userId;
    const role = socket.data.user.role;
    connectedUsers.set(userId, socket.id);
    
    console.log(`User connected: ${userId} (${role})`);

    // Handle Driver going online/offline
    socket.on('driver_status', async (data: { isOnline: boolean }) => {
      if (role !== 'driver') return;
      await User.findByIdAndUpdate(userId, { isOnline: data.isOnline }, { returnDocument: 'after' });
      
      if (data.isOnline) {
        // Find all pending rides and notify this specific driver
        const pendingRides = await Ride.find({ status: 'pending' });
        pendingRides.forEach(ride => {
          socket.emit('new_ride_request', {
            rideId: ride._id,
            pickup: { address: ride.pickupLocation.address },
            dropoff: { address: ride.dropoffLocation.address },
            fare: ride.fare,
            riderId: ride.riders[0],
            riderName: "A waiting student" // We can improve this with a lookup later
          });
        });
      } else {
        driversLocation.delete(userId);
      }
      console.log(`Driver ${userId} status: ${data.isOnline}`);
    });

    // Handle Driver location updates
    socket.on('driver_location', async (data: { lat: number, lng: number }) => {
      if (role !== 'driver') return;
      driversLocation.set(userId, data);
      
      // Update DB less frequently in real app, but for now let's just keep it in memory
      await User.findByIdAndUpdate(userId, {
        currentLocation: {
          type: 'Point',
          coordinates: [data.lng, data.lat] // GeoJSON is [longitude, latitude]
        }
      }, { returnDocument: 'after' });
      
      // If the driver is in a ride room, broadcast location to the rider
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          io.to(room).emit('driver_moved', data);
        }
      });
    });

    // Handle Rider requesting a ride
    socket.on('request_ride', async (data: { pickup: any, dropoff: any, fare: number, isPublic?: boolean, maxRiders?: number }) => {
      if (role !== 'rider' && role !== 'admin') return;
      
      try {
        // Double-tap prevention: check if user already has a pending ride created in the last 10 seconds
        const recentRide = await Ride.findOne({
          riders: userId,
          status: 'pending',
          createdAt: { $gt: new Date(Date.now() - 10000) }
        });

        if (recentRide) {
          console.log(`[Socket] Duplicate ride request ignored for user ${userId}`);
          return;
        }

        // Create pending ride in DB
        const newRide = new Ride({
          riders: [userId],
          pickupLocation: {
            type: 'Point',
            coordinates: [data.pickup.lng, data.pickup.lat],
            address: data.pickup.address || 'Unknown'
          },
          dropoffLocation: {
            type: 'Point',
            coordinates: [data.dropoff.lng, data.dropoff.lat],
            address: data.dropoff.address || 'Unknown'
          },
          fare: data.fare,
          status: 'pending',
          isPublic: data.isPublic !== false, // default to true for carpooling
          riderSegments: [{
            userId: userId as any,
            pickupLocation: {
              type: 'Point',
              coordinates: [data.pickup.lng, data.pickup.lat],
              address: data.pickup.address || 'Unknown'
            },
            dropoffLocation: {
              type: 'Point',
              coordinates: [data.dropoff.lng, data.dropoff.lat],
              address: data.dropoff.address || 'Unknown'
            },
            distance: 0 // Will be calculated or we can use a heuristic
          }]
        });
        
        await newRide.save();

        // Simple matching logic: find nearest online driver
        // (For MVP, we just find any online driver within a reasonable distance, or just all online drivers)
        // Here we'll just broadcast to all online drivers for simplicity
        // A better approach is using GeoSpatial queries with MongoDB `$near`
        const onlineDrivers = await User.find({ role: 'driver', isOnline: true });
        
        if (onlineDrivers.length === 0) {
          socket.emit('searching_for_drivers', { message: 'No drivers online. We will notify you when one joins.' });
        }

        // Notify the requester that the ride was created successfully
        socket.emit('ride_request_success', { rideId: newRide._id });

        // Just notify all online drivers (simplification of matching)
        // They can race to accept it
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        for (const driver of onlineDrivers) {
          const driverSocketId = connectedUsers.get(driver._id.toString());
          if (driverSocketId) {
            io.to(driverSocketId).emit('new_ride_request', {
              rideId: newRide._id,
              pickup: data.pickup,
              dropoff: data.dropoff,
              fare: data.fare,
              riderId: userId,
              riderName: user.isAnonymous ? user.pseudonym : user.name
            });
          }
        }
      } catch (err) {
        console.error(err);
        socket.emit('ride_request_failed', { message: 'Error creating ride' });
      }
    });

    // Handle Driver accepting a ride
    socket.on('accept_ride', async (data: { rideId: string }) => {
      if (role !== 'driver') return;
      
      try {
        const ride = await Ride.findById(data.rideId);
        if (!ride || ride.status !== 'pending') {
          socket.emit('ride_acceptance_failed', { message: 'Ride no longer available' });
          return;
        }

        // Update ride
        ride.driver = userId;
        ride.status = 'accepted';
        await ride.save();

        // Create a socket room for this ride
        const roomName = `ride_${ride._id}`;
        socket.join(roomName);

        const riderSocketIds = ride.riders.map(r => connectedUsers.get(r.toString())).filter(Boolean);
        riderSocketIds.forEach(id => {
          if (id) {
            const riderSocket = io.sockets.sockets.get(id);
            if (riderSocket) riderSocket.join(roomName);
            
            io.to(id).emit('ride_accepted', { 
              rideId: ride._id,
              driverId: userId,
              driverLocation: driversLocation.get(userId)
            });
          }
        });
        
        // Notify driver of success
        socket.emit('ride_accepted_success', { rideId: ride._id });

        // Tell other drivers this request is gone
        // Could send a 'cancel_request' event to them
      } catch (err) {
        console.error(err);
      }
    });

    // Handle joining an existing ride via socket (to join the room)
    socket.on('join_ride_room', (data: { rideId: string }) => {
      const roomName = `ride_${data.rideId}`;
      socket.join(roomName);
      console.log(`User ${userId} joined room ${roomName}`);
      
      // Notify others in room
      socket.to(roomName).emit('rider_joined', {
        userId,
        name: socket.data.user.isAnonymous ? socket.data.user.pseudonym : socket.data.user.name
      });
    });

    // Handle ride status updates
    socket.on('update_ride_status', async (data: { rideId: string, status: string }) => {
      try {
        const ride = await Ride.findById(data.rideId);
        if (!ride) {
          console.log(`[Socket] Ride ${data.rideId} not found`);
          return;
        }

        // Allow if user is driver OR organizer (first rider) OR admin
        const isOrganizer = ride.riders[0].toString() === userId;
        const isDriver = ride.driver?.toString() === userId;
        const isAdmin = role === 'admin';

        if (!isDriver && !isOrganizer && !isAdmin) {
          console.warn(`[Socket] Unauthorized status update attempt for ride ${data.rideId} by user ${userId}`);
          return;
        }

        // Prevent double charging if already completed
        if (ride.status === 'completed' && data.status === 'completed') {
          console.log(`[Socket] Ride ${data.rideId} already completed. Skipping deduction.`);
          return;
        }

        const oldStatus = ride.status;
        ride.status = data.status as any;
        await ride.save();

        console.log(`[Socket] Ride ${data.rideId} status updated: ${oldStatus} -> ${data.status}`);

        // If completed, deduct fare from riders and pay driver proportionally
        if (data.status === 'completed' && oldStatus !== 'completed') {
          const riderCount = ride.riders.length;
          if (riderCount > 0) {
            console.log(`[Socket] Completing ride ${data.rideId}. Total Fare: ${ride.fare}`);

            // 1. Calculate distances for each segment using real road routing
            let totalWeightedDistance = 0;
            const segmentDistances = await Promise.all(ride.riderSegments.map(async (segment) => {
              const d = await getRoadDistance(
                segment.pickupLocation.coordinates[1],
                segment.pickupLocation.coordinates[0],
                segment.dropoffLocation.coordinates[1],
                segment.dropoffLocation.coordinates[0]
              );
              return { userId: segment.userId, distance: d };
            }));

            totalWeightedDistance = segmentDistances.reduce((acc, s) => acc + s.distance, 0);
            console.log(`[Socket] Total Weighted Road Distance: ${totalWeightedDistance}km`);

            // 2. Deduct proportionally from each rider
            for (const seg of segmentDistances) {
              const proportion = totalWeightedDistance > 0 ? (seg.distance / totalWeightedDistance) : (1 / riderCount);
              const riderFare = Number((ride.fare * proportion).toFixed(2));
              
              console.log(`[Socket] Rider ${seg.userId} pays ₹${riderFare} for road-distance ${seg.distance.toFixed(2)}km`);
              
              await User.findByIdAndUpdate(seg.userId, { $inc: { walletBalance: -riderFare } });
            }

            // 3. Pay driver (total fare)
            if (ride.driver) {
              await User.findByIdAndUpdate(ride.driver, { $inc: { walletBalance: ride.fare } });
            }
          } else {
            console.warn(`[Socket] Ride ${data.rideId} completed but has no riders!`);
          }
        }

        const roomName = `ride_${data.rideId}`;
        io.to(roomName).emit('ride_status_updated', { status: data.status });
      } catch (err) {
        console.error('[Socket] Error in update_ride_status:', err);
      }
    });

    // SOS Trigger
    socket.on('sos_trigger', async (data: { rideId: string }) => {
      try {
        const userId = connectedUsers.get(socket.id);
        const ride = await Ride.findById(data.rideId).populate('riders', 'name pseudonym');
        const user = await User.findById(userId);

        if (!ride || !user) return;

        console.error(`[SOS] EMERGENCY TRIGGERED by ${user.name} for ride ${data.rideId}`);

        // Broadcast to all connected users (for now, in production this would be admin-only)
        io.emit('sos_alert', {
          rideId: data.rideId,
          userId: user._id,
          userName: user.isAnonymous ? user.pseudonym : user.name,
          location: ride.pickupLocation, // Or current driver location if available
          timestamp: new Date()
        });

        // Also notify the specific ride room
        io.to(`ride_${data.rideId}`).emit('emergency_status', {
          message: 'Emergency services have been notified.',
          severity: 'high'
        });

      } catch (error) {
        console.error('[Socket] Error triggering SOS:', error);
      }
    });

    // Handle chat messages
    socket.on('send_message', async (data: { rideId: string, content: string }) => {
      try {
        const newMessage = new Message({
          rideId: data.rideId,
          senderId: userId,
          content: data.content
        });
        await newMessage.save();

        const roomName = `ride_${data.rideId}`;
        const user = await User.findById(userId);
        
        io.to(roomName).emit('new_message', {
          id: newMessage._id,
          content: newMessage.content,
          senderId: userId,
          senderEmail: user?.email,
          senderName: user?.isAnonymous ? user?.pseudonym : user?.name,
          sentAt: newMessage.createdAt
        });
      } catch (err) {
        console.error('[Socket] Error in send_message:', err);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      connectedUsers.delete(userId);
      if (role === 'driver') {
        driversLocation.delete(userId);
        await User.findByIdAndUpdate(userId, { isOnline: false }, { returnDocument: 'after' });
      }
    });
  });
};
