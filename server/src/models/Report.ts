import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  reportedUserId?: mongoose.Types.ObjectId;
  rideId?: mongoose.Types.ObjectId;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
}

const ReportSchema: Schema = new Schema({
  reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  rideId: { type: Schema.Types.ObjectId, ref: 'Ride' },
  reason: { type: String, required: true },
  details: { type: String },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' }
}, { timestamps: true });

export const Report = mongoose.model<IReport>('Report', ReportSchema);