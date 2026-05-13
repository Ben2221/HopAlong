import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import rideRoutes from './routes/rides';
import userRoutes from './routes/user';
import contactRoutes from './routes/contact';
import adminRoutes from './routes/admin';
import chatRoutes from './routes/chat';
import walletRoutes from './routes/wallet';
import recurringRoutes from './routes/recurring';
import notificationRoutes from './routes/notifications';
import { setupSocket } from './sockets/index';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development, allow all
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rideshare';

// CORS Configuration for Production
const allowedOrigins = [
  'http://localhost:5173',
  'https://hopalong.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/user', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/notifications', notificationRoutes);

import { GlobalSettings } from './models/GlobalSettings';
app.get('/api/settings/public', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.json({ 
      status: 'success', 
      data: { 
        broadcastBanner: settings?.broadcastBanner || { isActive: false, message: '', type: 'info' } 
      } 
    });
  } catch (error) {
    res.status(500).json({ status: 'error' });
  }
});

// Autocomplete route
app.post('/api/autocomplete', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.json({ status: 'success', payload: [] });
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    let suggestions = [];
    
    console.log(`[Autocomplete] Searching for: "${address}"`);
    
    try {
      // Added lat/lon bias for Kerala, India region to speed up local results
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=5&lat=9.75&lon=76.65`, {
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      if (!response.ok) throw new Error(`Photon error: ${response.status}`);
      const data = await response.json() as any;
      
      suggestions = data.features.map((feature: any) => ({
        name: feature.properties.name || feature.properties.street || '',
        city: feature.properties.city || feature.properties.state || '',
        street: feature.properties.street || '',
        formatted: [feature.properties.name, feature.properties.city, feature.properties.country].filter(Boolean).join(', '),
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0]
      }));
    } catch (photonError: any) {
      const isTimeout = photonError.name === 'AbortError';
      console.warn(`[Autocomplete] Photon ${isTimeout ? 'timed out' : 'failed'}, trying fallback...`);
      clearTimeout(timeout);
      
      // Fallback to Nominatim
      try {
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 8000);
        
        // Added viewbox bias for Nominatim to focus on the Kerala region
        const fallbackResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5&addressdetails=1&viewbox=75.5,10.5,77.5,8.5&bounded=0`, {
          headers: {
            'User-Agent': 'HopAlong-Carpool-App/1.0 (Student Project; contact: dev@hopalong.edu)'
          },
          signal: fallbackController.signal
        });
        clearTimeout(fallbackTimeout);
        
        if (!fallbackResponse.ok) throw new Error(`Nominatim error: ${fallbackResponse.status}`);
        const data = await fallbackResponse.json() as any[];
        
        suggestions = data.map((item: any) => ({
          name: item.name || item.address?.road || '',
          city: item.address?.city || item.address?.town || item.address?.state || '',
          street: item.address?.road || '',
          formatted: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon)
        }));
      } catch (fallbackError: any) {
        const isFallbackTimeout = fallbackError.name === 'AbortError';
        console.error(`[Autocomplete] All services failed. Nominatim ${isFallbackTimeout ? 'timed out' : 'failed'}.`);
        return res.json({ status: 'success', payload: [] });
      }
    }

    res.json({ status: 'success', payload: suggestions });
  } catch (error) {
    console.error('[Autocomplete] Fatal error:', error);
    res.json({ status: 'success', payload: [] });
  }
});

// Socket.io
setupSocket(io);

// Database connection and server start
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

// Export app for Vercel
export default app;
