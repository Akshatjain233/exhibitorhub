const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@exhibitorhub.com';
    const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'ExhibitorHub';

    if (!BREVO_API_KEY) {
        console.warn('⚠️ BREVO_API_KEY not set. Email not sent (Dev Mode).');
        console.log(`📧 [DEV] To: ${to}, Subject: ${subject}`);
        return { success: true, dev_mode: true };
    }

    try {
        const response = await axios.post(
            BREVO_API_URL,
            {
                sender: { email: SENDER_EMAIL, name: SENDER_NAME },
                to: [{ email: to }],
                subject,
                htmlContent,
                textContent: textContent || htmlContent.replace(/<[^>]*>/g, ''),
            },
            {
                headers: {
                    'api-key': BREVO_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log(`✅ Email sent to ${to}: ${subject}`);
        return { success: true, messageId: response.data.messageId };
    } catch (error) {
        console.error('❌ Brevo email send error:', error.response?.data || error.message);
        throw new Error('Failed to send email');
    }
};

const sendOTPEmail = async (email, otp, name = 'User') => {
    const subject = 'Your ExhibitorHub Verification Code';
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
                .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 4px; text-align: center; padding: 20px; background: #f0f0f0; border-radius: 4px; margin: 20px 0; }
                .footer { color: #999; font-size: 12px; text-align: center; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Hello ${name},</h2>
                <p>Your verification code for ExhibitorHub is:</p>
                <div class="otp-code">${otp}</div>
                <p>This code will expire in <strong>10 minutes</strong>.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <div class="footer">
                    <p>© 2026 ExhibitorHub</p>
                </div>
            </div>
        </body>
        </html>
    `;
    return sendEmail({ to: email, subject, htmlContent });
};

const sendWelcomeEmail = async (email, name, role = 'VISITOR') => {
    const subject = `Welcome to ExhibitorHub, ${name}!`;
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
                .header { text-align: center; color: #4CAF50; }
                .content { line-height: 1.6; }
                .footer { color: #999; font-size: 12px; text-align: center; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="header">Welcome to ExhibitorHub!</h1>
                <div class="content">
                    <p>Hello ${name},</p>
                    <p>Thank you for joining ExhibitorHub.</p>
                    <p>Get started by exploring upcoming exhibitions and managing your profile!</p>
                </div>
                <div class="footer">
                    <p>© 2026 ExhibitorHub</p>
                </div>
            </div>
        </body>
        </html>
    `;
    return sendEmail({ to: email, subject, htmlContent });
};

module.exports = {
    sendEmail,
    sendOTPEmail,
    sendWelcomeEmail
};
