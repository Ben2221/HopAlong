import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Ride } from '../models/Ride';
import { Message } from '../models/Message';
import { Transaction } from '../models/Transaction';
import { calculateDistance } from '../utils/haversine';
import { getRoadDistance } from '../utils/routing';

// Store connected users: socketId -> userId
const connectedUsers = new Map<string, string>();
// Store drivers current location in memory for fast lookup
const hostsLocation = new Map<string, { lat: number, lng: number }>();

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

    // Handle Host going online/offline
    socket.on('host_status', async (data: { isOnline: boolean }) => {
      if (role !== 'student' && role !== 'admin') return;
      await User.findByIdAndUpdate(userId, { isOnline: data.isOnline }, { returnDocument: 'after' });
      
      if (data.isOnline) {
        const pendingRides = await Ride.find({ status: 'pending' });
        pendingRides.forEach(ride => {
          socket.emit('new_ride_invite', {
            rideId: ride._id,
            pickup: { address: ride.pickupLocation.address },
            dropoff: { address: ride.dropoffLocation.address },
            fare: ride.fare,
            riderId: ride.riders[0],
            riderName: "A waiting student"
          });
        });
      } else {
        hostsLocation.delete(userId);
      }
    });

    // Handle Host location updates
    socket.on('host_location', async (data: { lat: number, lng: number }) => {
      hostsLocation.set(userId, data);
      await User.findByIdAndUpdate(userId, {
        currentLocation: {
          type: 'Point',
          coordinates: [data.lng, data.lat]
        }
      }, { returnDocument: 'after' });
      
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          io.to(room).emit('host_moved', data);
        }
      });
    });

    // Handle Rider requesting a ride
    socket.on('request_ride', async (data: { pickup: any, dropoff: any, fare: number, isPublic?: boolean, maxRiders?: number, departureTime?: any }) => {
      if (role !== 'student' && role !== 'admin') return;
      
      try {
        console.log(`[Socket] request_ride received from ${userId}`, data);

        // Double-tap prevention: check if user already has a pending ride created in the last 10 seconds
        const recentRide = await Ride.findOne({
          riders: userId,
          status: 'pending',
          createdAt: { $gt: new Date(Date.now() - 10000) }
        });

        if (recentRide) {
          console.log(`[Socket] Duplicate ride request ignored for user ${userId}`);
          socket.emit('ride_request_success', { rideId: recentRide._id });
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
          isPublic: data.isPublic !== false,
          departureTime: data.departureTime || new Date(),
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
            distance: 0
          }]
        });
        
        await newRide.save();

        const onlineStudents = await User.find({ role: 'student', isOnline: true });
        
        if (onlineStudents.length === 0) {
          socket.emit('searching_for_hosts', { message: 'No students online to host. We will notify you when one joins.' });
        }

        // Notify the requester
        socket.emit('ride_request_success', { rideId: newRide._id });

        // BROADCAST to everyone that a new ride is available
        if (newRide.isPublic) {
          io.emit('new_ride_available', { rideId: newRide._id });
        }

        // Notify potential hosts
        const user = await User.findById(userId);
        if (user) {
          for (const host of onlineStudents) {
            const hostSocketId = connectedUsers.get(host._id.toString());
            if (hostSocketId) {
              io.to(hostSocketId).emit('new_ride_invite', {
                rideId: newRide._id,
                pickup: data.pickup,
                dropoff: data.dropoff,
                fare: data.fare,
                riderId: userId,
                riderName: user.isAnonymous ? user.pseudonym : user.name
              });
            }
          }
        }
      } catch (err) {
        console.error('[Socket] Error creating ride:', err);
        socket.emit('ride_request_failed', { message: 'Error creating ride' });
      }
    });

    // Handle Host accepting a ride
    socket.on('accept_ride', async (data: { rideId: string }) => {
      try {
        const ride = await Ride.findById(data.rideId);
        if (!ride || ride.status !== 'pending') {
          socket.emit('ride_acceptance_failed', { message: 'Ride no longer available' });
          return;
        }

        ride.host = userId as any;
        ride.status = 'accepted';
        await ride.save();

        const roomName = `ride_${ride._id}`;
        socket.join(roomName);

        ride.riders.forEach(r => {
          const riderSocketId = connectedUsers.get(r.toString());
          if (riderSocketId) {
            const riderSocket = io.sockets.sockets.get(riderSocketId);
            if (riderSocket) riderSocket.join(roomName);
            io.to(riderSocketId).emit('ride_accepted', { 
              rideId: ride._id,
              hostId: userId,
              hostLocation: hostsLocation.get(userId)
            });
          }
        });
        
        socket.emit('ride_accepted_success', { rideId: ride._id });
      } catch (err) {
        console.error('[Socket] Error accepting ride:', err);
      }
    });

    socket.on('join_ride_room', (data: { rideId: string }) => {
      const roomName = `ride_${data.rideId}`;
      socket.join(roomName);
      console.log(`User ${userId} joined room ${roomName}`);
    });

    socket.on('update_ride_status', async (data: { rideId: string, status: string }) => {
      try {
        const ride = await Ride.findById(data.rideId);
        if (!ride) return;

        const isOrganizer = ride.riders[0].toString() === userId;
        const isAdmin = role === 'admin';

        if (!isOrganizer && !isAdmin) {
          console.warn(`[Socket] Unauthorized status update attempt for ride ${data.rideId} by user ${userId}`);
          return;
        }

        const oldStatus = ride.status;
        ride.status = data.status as any;
        await ride.save();

        if (data.status === 'completed' && oldStatus !== 'completed') {
          // Proportionate fare deduction logic
          const segmentDistances = await Promise.all(ride.riderSegments.map(async (segment) => {
            const d = await getRoadDistance(
              segment.pickupLocation.coordinates[1],
              segment.pickupLocation.coordinates[0],
              segment.dropoffLocation.coordinates[1],
              segment.dropoffLocation.coordinates[0]
            );
            return { userId: segment.userId, distance: d };
          }));

          const totalWeightedDistance = segmentDistances.reduce((acc, s) => acc + s.distance, 0);

          const organizerId = ride.riders[0].toString();
          
          for (const seg of segmentDistances) {
            // Organizer doesn't pay themselves
            if (seg.userId.toString() === organizerId) continue;

            const proportion = totalWeightedDistance > 0 ? (seg.distance / totalWeightedDistance) : (1 / ride.riders.length);
            const riderFare = Number((ride.fare * proportion).toFixed(2));
            
            console.log(`[Socket] Rider ${seg.userId} pays ₹${riderFare} to Organizer ${organizerId}`);
            
            // Deduct from passenger
            await User.findByIdAndUpdate(seg.userId, { $inc: { walletBalance: -riderFare } });
            // Credit to organizer
            await User.findByIdAndUpdate(organizerId, { $inc: { walletBalance: riderFare } });

            // Transaction for Passenger (Debit)
            await Transaction.create({
              userId: seg.userId,
              rideId: ride._id,
              amount: riderFare,
              type: 'debit',
              description: `Fare share for ride to ${ride.dropoffLocation.address}`
            });

            // Transaction for Organizer (Credit from passenger)
            await Transaction.create({
              userId: organizerId,
              rideId: ride._id,
              amount: riderFare,
              type: 'credit',
              description: `Fare split received from passenger for ride to ${ride.dropoffLocation.address}`
            });
          }
        }

        io.to(`ride_${data.rideId}`).emit('ride_status_updated', { status: data.status });
      } catch (err) {
        console.error('[Socket] Error updating status:', err);
      }
    });

    socket.on('sos_trigger', async (data: { rideId: string }) => {
      try {
        const user = await User.findById(userId);
        const ride = await Ride.findById(data.rideId);
        if (!user || !ride) return;

        console.log(`[SOS] EMERGENCY TRIGGERED by ${user.name} for ride ${data.rideId}`);

        // Broadcast to EVERYONE connected
        io.emit('sos_alert', {
          rideId: data.rideId,
          userId: user._id,
          userName: user.isAnonymous ? user.pseudonym : user.name,
          location: ride.pickupLocation,
          timestamp: new Date()
        });

        // Also notify the specific ride room with high severity
        io.to(`ride_${data.rideId}`).emit('emergency_status', {
          message: `${user.isAnonymous ? user.pseudonym : user.name} has triggered an SOS! Emergency services and campus security are being notified.`,
          severity: 'high'
        });
      } catch (err) {
        console.error('[Socket] Error in SOS:', err);
      }
    });

    socket.on('send_message', async (data: { rideId: string, content: string }) => {
      try {
        const newMessage = new Message({
          rideId: data.rideId,
          senderId: userId,
          content: data.content
        });
        await newMessage.save();

        const user = await User.findById(userId);
        io.to(`ride_${data.rideId}`).emit('new_message', {
          id: newMessage._id,
          content: newMessage.content,
          senderId: userId,
          senderName: user?.isAnonymous ? user?.pseudonym : user?.name,
          sentAt: newMessage.createdAt
        });
      } catch (err) {
        console.error('[Socket] Error in chat:', err);
      }
    });

    socket.on('disconnect', async () => {
      connectedUsers.delete(userId);
      if (role === 'student' || role === 'admin') {
        hostsLocation.delete(userId);
        await User.findByIdAndUpdate(userId, { isOnline: false });
      }
    });
  });
};
