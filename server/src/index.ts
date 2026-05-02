import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import rideRoutes from './routes/rides';
import userRoutes from './routes/user';
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

// Autocomplete route
app.post('/api/autocomplete', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.json({ status: 'success', payload: [] });
    
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=5`);
    const data = await response.json() as any;
    
    const suggestions = data.features.map((feature: any) => ({
      name: feature.properties.name || feature.properties.street || '',
      city: feature.properties.city || feature.properties.state || '',
      street: feature.properties.street || '',
      formatted: [feature.properties.name, feature.properties.city, feature.properties.country].filter(Boolean).join(', '),
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0]
    }));

    res.json({ status: 'success', payload: suggestions });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch suggestions' });
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
