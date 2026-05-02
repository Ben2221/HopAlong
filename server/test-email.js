// Run this file using: node test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    const transporter = nodemailer.createTransport({
        // Make sure your .env file has these variables!
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: Number(process.env.SMTP_PORT) || 2525,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
    });

    try {
        console.log("Attempting to send test email...");
        const info = await transporter.sendMail({
            from: `"HopAlong Test" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,

            // ⚠️ CHANGE THIS TO YOUR PERSONAL EMAIL ⚠️
            to: 'bensavio2221@gmail.com',

            subject: 'HopAlong SMTP Verification Test',
            text: 'If you are reading this, your Brevo SMTP configuration works perfectly!',
        });
        console.log('✅ Success! Email sent to Brevo. Message ID:', info.messageId);
        console.log('Now check your inbox (and your spam folder!)');
    } catch (error) {
        console.error('❌ Failed to send email. Error details:');
        console.error(error);
    }
}

testEmail();
