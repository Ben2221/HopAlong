import mongoose, { Schema, Document } from 'mongoose';

export interface IGlobalSettings extends Document {
  baseFare: number;
  pricePerKm: number;
  broadcastBanner: {
    message: string;
    isActive: boolean;
    type: 'info' | 'warning' | 'alert';
  };
  maintenanceMode: boolean;
}

const globalSettingsSchema = new Schema<IGlobalSettings>({
  baseFare: { type: Number, default: 20 },
  pricePerKm: { type: Number, default: 10 },
  broadcastBanner: {
    message: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    type: { type: String, enum: ['info', 'warning', 'alert'], default: 'info' }
  },
  maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

export const GlobalSettings = mongoose.model<IGlobalSettings>('GlobalSettings', globalSettingsSchema);
