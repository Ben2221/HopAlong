import mongoose, { Document, Schema } from 'mongoose';

export interface IRecurringRide extends Document {
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
  daysOfWeek: string[]; // e.g., ["Monday", "Wednesday"]
  departureTime: string; // HH:mm format
  description?: string;
  estimatedCostPerHead: number;
  isActive: boolean;
}

const RecurringRideSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pickupLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true }
  },
  dropoffLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true }
  },
  daysOfWeek: [{ type: String }],
  departureTime: { type: String, required: true },
  description: { type: String },
  estimatedCostPerHead: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

RecurringRideSchema.index({ pickupLocation: '2dsphere' });
RecurringRideSchema.index({ dropoffLocation: '2dsphere' });

export const RecurringRide = mongoose.model<IRecurringRide>('RecurringRide', RecurringRideSchema);