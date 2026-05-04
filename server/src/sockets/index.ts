import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Ride } from '../models/Ride';
import { Message } from '../models/Message';

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
          isPublic: data.isPublic !== false // default to true for carpooling
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

        // Just notify all online drivers (simplification of matching)
        // They can race to accept it
        for (const driver of onlineDrivers) {
          const driverSocketId = connectedUsers.get(driver._id.toString());
          if (driverSocketId) {
            io.to(driverSocketId).emit('new_ride_request', {
              rideId: newRide._id,
              pickup: data.pickup,
              dropoff: data.dropoff,
              fare: data.fare,
              riderId: userId,
              riderName: socket.data.user.isAnonymous ? socket.data.user.pseudonym : socket.data.user.name
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
      if (role !== 'driver') return;
      
      try {
        const ride = await Ride.findById(data.rideId);
        if (!ride) {
          console.log(`[Socket] Ride ${data.rideId} not found`);
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

        // If completed, deduct fare from riders and pay driver
        if (data.status === 'completed' && oldStatus !== 'completed') {
          const riderCount = ride.riders.length;
          if (riderCount > 0) {
            const splitFare = Number((ride.fare / riderCount).toFixed(2));
            
            console.log(`[Socket] Completing ride ${data.rideId}. Fare: ${ride.fare}, Split: ${splitFare}, Riders: ${riderCount}`);

            // Deduct from riders
            const deductionResult = await User.updateMany(
              { _id: { $in: ride.riders as any } },
              { $inc: { walletBalance: -splitFare } }
            );
            console.log(`[Socket] Riders deduction result:`, deductionResult);

            // Pay driver (total fare)
            if (ride.driver) {
              const driverPaymentResult = await User.findByIdAndUpdate(
                ride.driver,
                { $inc: { walletBalance: ride.fare } },
                { returnDocument: 'after' }
              );
              console.log(`[Socket] Driver payment result for ${ride.driver}:`, !!driverPaymentResult);
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
