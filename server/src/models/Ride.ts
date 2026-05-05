import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IRide extends Document {
  riders: (mongoose.Types.ObjectId | IUser)[];
  driver?: mongoose.Types.ObjectId | IUser;
  maxRiders: number;
  isPublic: boolean;
  pickupLocation: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  dropoffLocation: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';
  fare: number;
  riderSegments: {
    userId: mongoose.Types.ObjectId;
    pickupLocation: {
      type: 'Point';
      coordinates: [number, number];
      address: string;
    };
    dropoffLocation: {
      type: 'Point';
      coordinates: [number, number];
      address: string;
    };
    distance: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const rideSchema = new Schema<IRide>({
  riders: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  driver: { type: Schema.Types.ObjectId, ref: 'User' },
  maxRiders: { type: Number, default: 4 },
  isPublic: { type: Boolean, default: true },
  pickupLocation: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true }
  },
  dropoffLocation: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true }
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
    default: 'pending'
  },
  fare: { type: Number, required: true },
  riderSegments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    pickupLocation: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
      address: { type: String }
    },
    dropoffLocation: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
      address: { type: String }
    },
    distance: { type: Number, default: 0 }
  }]
}, { timestamps: true });

export const Ride = mongoose.model<IRide>('Ride', rideSchema);
