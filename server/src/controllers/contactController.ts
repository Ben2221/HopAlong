import { Request, Response } from 'express';
import { sendEmail } from '../utils/emailService';

export const sendContactEmail = async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Please provide name, email and message' 
    });
  }

  try {
    // Send email to the administrator (You)
    await sendEmail({
      email: 'bensavio2221@gmail.com', // Your personal email to receive requests
      subject: `New Contact Request from ${name}`,
      message: `
        You have a new contact request from HopAlong home page:
        
        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 15px;">
          <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">New Contact Request</h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 10px; border-left: 4px solid #d1d5db;">
            <p style="margin-top: 0; font-weight: bold; color: #374151;">Message:</p>
            <p style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
            Sent from HopAlong Homepage Contact Form
          </p>
        </div>
      `
    });

    res.status(200).json({ 
      status: 'success', 
      message: 'Message sent successfully' 
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to send message. Please try again later.' 
    });
  }
};
