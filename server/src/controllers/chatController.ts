import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { AuthRequest } from '../utils/authMiddleware';

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rideId } = req.params;
    const messages = await Message.find({ rideId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name email pseudonym isAnonymous');
    
    res.json({
      status: 'success',
      messages: messages.map(m => ({
        id: m._id,
        content: m.content,
        senderId: (m.senderId as any)._id,
        senderEmail: (m.senderId as any).email,
        senderName: (m.senderId as any).isAnonymous ? (m.senderId as any).pseudonym : (m.senderId as any).name,
        sentAt: m.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching chat history' });
  }
};
