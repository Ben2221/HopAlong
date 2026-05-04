import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  rideId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
