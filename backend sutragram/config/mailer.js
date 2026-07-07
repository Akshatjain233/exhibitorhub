import axios from 'axios';

/**
 * Send email using Brevo (formerly Sendinblue) API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise} - Brevo API response
 */
async function sendMail({ to, subject, text, html }) {
    if (!process.env.BREVO_API_KEY) {
        throw new Error('❌ BREVO_API_KEY not set in environment variables');
    }

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: 'Artisan Showcase Platform',
                    email: 'no-reply@snacktrack.me',
                },
                to: [{ email: to }],
                subject: subject || 'Artisan Platform Notification',
                textContent: text,
                htmlContent: html,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                },
            }
        );

        console.log('✅ Email sent successfully to:', to);
        return response.data;
    } catch (err) {
        console.error('❌ Brevo API Error:', err.response?.data || err.message);
        throw new Error(
            `❌ Error sending email: ${err.response?.data?.message || err.message}`
        );
    }
}

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} name - User's name
 */
async function sendOTPEmail(email, otp, name = 'User') {
    const subject = 'Verify Your Email - Artisan Showcase Platform';
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .otp-box {
            background-color: #f0f0f0;
            border: 2px dashed #667eea;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 8px;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Artisan Showcase Platform</h1>
        </div>
        <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for registering with Artisan Showcase Platform. To complete your registration, please verify your email address using the OTP below:</p>
            
            <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
                <p class="otp-code">${otp}</p>
                <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
                <li>This OTP is valid for 10 minutes only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
            </ul>
            
            <p>Welcome to the platform connecting Indian artisans with the world!</p>
            
            <p>Best regards,<br>
            <strong>Artisan Showcase Platform Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
            <p>&copy; 2026 Artisan Showcase Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
Hello ${name}!

Thank you for registering with Artisan Showcase Platform.

Your verification code is: ${otp}

This OTP is valid for 10 minutes only.
Do not share this code with anyone.

If you didn't request this, please ignore this email.

Best regards,
Artisan Showcase Platform Team
    `;

    return sendMail({ to: email, subject, text, html });
}

/**
 * Send welcome email after successful verification
 * @param {string} email - Recipient email
 * @param {string} name - User's name
 * @param {string} role - User's role
 */
async function sendWelcomeEmail(email, name, role) {
    const subject = 'Welcome to Artisan Showcase Platform! 🎉';
    
    const roleMessages = {
        artisan: 'Start showcasing your beautiful crafts to consumers worldwide!',
        consumer: 'Discover authentic handmade crafts from talented Indian artisans!',
        trader: 'Connect with artisans for bulk orders and wholesale opportunities!',
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Artisan Showcase Platform!</h1>
        </div>
        <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Your email has been successfully verified. Welcome aboard!</p>
            <p><strong>${roleMessages[role] || 'Start exploring the platform!'}</strong></p>
            <p>You can now access all features of the platform.</p>
            <p>Best regards,<br>
            <strong>Artisan Showcase Platform Team</strong></p>
        </div>
    </div>
</body>
</html>
    `;

    const text = `
Hello ${name}!

Your email has been successfully verified. Welcome to Artisan Showcase Platform!

${roleMessages[role] || 'Start exploring the platform!'}

Best regards,
Artisan Showcase Platform Team
    `;

    return sendMail({ to: email, subject, text, html });
}

export { sendMail, sendOTPEmail, sendWelcomeEmail };
