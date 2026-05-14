import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin';
  isAnonymous: boolean;
  pseudonym: string;
  walletBalance: number;
  status: 'active' | 'suspended' | 'banned';
  batchYear?: number;
  department?: string;
  trustScore: number;
  socialLinks?: {
    twitter?: string;
    github?: string;
  };
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isOnline: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  pushToken?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student', required: true },
  isAnonymous: { type: Boolean, default: false },
  pseudonym: { type: String, required: true },
  walletBalance: { type: Number, default: 1000 }, // Starting balance for demo
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  batchYear: { type: Number },
  department: { type: String },
  trustScore: { type: Number, default: 4.5 }, // Initial trust score
  socialLinks: {
    twitter: { type: String },
    github: { type: String },
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    }
  },
  isOnline: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  pushToken: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.pseudonym) {
    const adjectives = ['Swift', 'Electric', 'Silver', 'Cool', 'Urban', 'Wild', 'Neon', 'Golden'];
    const animals = ['Cheetah', 'Falcon', 'Raven', 'Panda', 'Shark', 'Wolf', 'Tiger', 'Lynx'];
    this.pseudonym = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${animals[Math.floor(Math.random() * animals.length)]}${Math.floor(Math.random() * 100)}`;
  }
});

userSchema.index({ currentLocation: '2dsphere' });

export const User = mongoose.model<IUser>('User', userSchema);
