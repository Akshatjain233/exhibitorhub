import axios from 'axios';

// Brevo (Sendinblue) Email Service
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
    // Read lazily so tests can mock these via process.env
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@snacktrack.me';
    const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'SutraGram';

    if (!BREVO_API_KEY) {
        console.warn('⚠️ BREVO_API_KEY not set. Email not sent (Dev Mode).');
        console.log(`📧 [DEV] To: ${to}, Subject: ${subject}`);
        return { success: true, dev_mode: true };
    }

    try {
        const response = await axios.post(
            BREVO_API_URL,
            {
                sender: {
                    email: SENDER_EMAIL,
                    name: SENDER_NAME,
                },
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

/**
 * Send OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} name - User name
 * @returns {Promise<Object>}
 */
export const sendOTPEmail = async (email, otp, name = 'User') => {
    const subject = 'Your SutraGram Verification Code';
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
                <p>Your verification code for SutraGram is:</p>
                <div class="otp-code">${otp}</div>
                <p>This code will expire in <strong>10 minutes</strong>.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <div class="footer">
                    <p>© 2026 SutraGram - Empowering Indian Artisans</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to: email, subject, htmlContent });
};

/**
 * Send welcome email
 * @param {string} email - Recipient email
 * @param {string} name - User name
 * @param {string} role - User role
 * @returns {Promise<Object>}
 */
export const sendWelcomeEmail = async (email, name, role = 'user') => {
    const subject = `Welcome to SutraGram, ${name}!`;
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
                .header { text-align: center; color: #4CAF50; }
                .content { line-height: 1.6; }
                .cta { text-align: center; margin: 30px 0; }
                .button { background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; }
                .footer { color: #999; font-size: 12px; text-align: center; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="header">🎨 Welcome to SutraGram!</h1>
                <div class="content">
                    <p>Hello ${name},</p>
                    <p>Thank you for joining SutraGram, India's premier platform connecting artisans with consumers.</p>
                    ${role === 'artisan'
            ? '<p><strong>As an artisan</strong>, you can now showcase your craft, connect with buyers, and grow your business.</p>'
            : '<p><strong>As a consumer</strong>, discover authentic handcrafted products and support Indian artisans directly.</p>'
        }
                    <p>Get started by completing your profile and exploring the platform!</p>
                </div>
                <div class="cta">
                    <a href="${process.env.FRONTEND_URL || 'https://sutragram.com'}" class="button">Explore Now</a>
                </div>
                <div class="footer">
                    <p>© 2026 SutraGram - Empowering Indian Artisans</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to: email, subject, htmlContent });
};

/**
 * Send admin notification email
 * @param {Object} data - Notification data
 * @returns {Promise<Object>}
 */
export const sendAdminNotification = async (data) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sutragram.com';
    const { subject, message, details } = data;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>🔔 Admin Notification</h2>
            <p><strong>${subject}</strong></p>
            <p>${message}</p>
            ${details ? `<pre style="background: #f0f0f0; padding: 15px; border-radius: 4px;">${JSON.stringify(details, null, 2)}</pre>` : ''}
        </body>
        </html>
    `;

    return sendEmail({ to: adminEmail, subject: `[Admin] ${subject}`, htmlContent });
};

/**
 * Send order confirmation email
 * @param {string} email - Customer email
 * @param {Object} order - Order details
 * @returns {Promise<Object>}
 */
export const sendOrderConfirmationEmail = async (email, order) => {
    const subject = `Order Confirmed - #${order._id}`;
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial; padding: 20px;">
            <h2>✅ Order Confirmed!</h2>
            <p>Your order has been confirmed and will be processed shortly.</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> ₹${order.total_amount}</p>
            <p>Track your order in the SutraGram app.</p>
        </body>
        </html>
    `;

    return sendEmail({ to: email, subject, htmlContent });
};

export default {
    sendEmail,
    sendOTPEmail,
    sendWelcomeEmail,
    sendAdminNotification,
    sendOrderConfirmationEmail,
};
