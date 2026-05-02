import nodemailer from 'nodemailer';

/**
 * Utility to send emails for HopAlong.
 * Uses Ethereal for development (mock inbox).
 */
export const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
  html?: string;
}) => {
  // Create a test account for development if no SMTP credentials are provided
  let transporter;
  
  if (process.env.SMTP_HOST) {
    // Production / User-provided SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: Auto-generate Ethereal account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('--- DEVELOPMENT EMAIL MODE ---');
    console.log('Test Account:', testAccount.user);
  }

  const mailOptions = {
    from: `"HopAlong" <${process.env.SMTP_USER || 'support@hopalong.iiitk'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);

  if (!process.env.SMTP_HOST) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }

  return info;
};

/**
 * Generate a professional HTML template for password reset
 */
export const getPasswordResetTemplate = (resetUrl: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f59e0b; margin: 0;">HopAlong</h1>
        <p style="color: #6b7280; font-size: 16px;">IIIT Kottayam's Ride Sharing Hub</p>
      </div>
      
      <div style="background-color: #fffbeb; padding: 30px; border-radius: 15px; border: 1px solid #fef3c7;">
        <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Hello student, <br><br>
          We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">Reset My Password</a>
        </div>
        
        <p style="color: #9ca3af; font-size: 14px;">
          This link will expire in 1 hour.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
        <p>© 2025 HopAlong | Developed for IIIT Kottayam Students</p>
      </div>
    </div>
  `;
};
