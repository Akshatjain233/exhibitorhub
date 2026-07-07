// Twilio SMS Service (Disabled by Default)
// Set ENABLE_SMS=true in .env to activate

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const ENABLE_SMS = process.env.ENABLE_SMS === 'true';

let twilioClient = null;

// Initialize Twilio client only if enabled
if (ENABLE_SMS && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    try {
        const twilio = await import('twilio');
        twilioClient = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        console.log('✅ Twilio SMS Service: ENABLED');
    } catch (error) {
        console.error('❌ Failed to initialize Twilio:', error.message);
    }
} else {
    console.log('ℹ️  Twilio SMS Service: DISABLED (using email for notifications)');
}

/**
 * Send SMS via Twilio
 * @param {string} phoneNumber - Recipient phone number (E.164 format)
 * @param {string} message - SMS message content
 * @returns {Promise<Object>}
 */
export const sendSMS = async (phoneNumber, message) => {
    // If SMS is disabled, log and skip
    if (!ENABLE_SMS) {
        console.log(`📱 [SMS DISABLED] To: ${phoneNumber}, Message: ${message}`);
        return { success: false, disabled: true, message: 'SMS service is disabled' };
    }

    if (!twilioClient) {
        console.error('❌ Twilio client not initialized');
        return { success: false, error: 'Twilio not configured' };
    }

    try {
        const result = await twilioClient.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        console.log(`✅ SMS sent to ${phoneNumber}: ${result.sid}`);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('❌ Twilio SMS error:', error.message);
        throw new Error('Failed to send SMS');
    }
};

/**
 * Send OTP via SMS
 * @param {string} phoneNumber - Phone number
 * @param {string} otp - OTP code
 * @returns {Promise<Object>}
 */
export const sendOTPSMS = async (phoneNumber, otp) => {
    const message = `Your SutraGram verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    return sendSMS(phoneNumber, message);
};

/**
 * Send order notification via SMS
 * @param {string} phoneNumber - Phone number
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>}
 */
export const sendOrderNotificationSMS = async (phoneNumber, orderId) => {
    const message = `Your SutraGram order #${orderId} has been confirmed! Track it in the app.`;
    return sendSMS(phoneNumber, message);
};

/**
 * Check if SMS is enabled
 * @returns {boolean}
 */
export const isSMSEnabled = () => ENABLE_SMS;

export default {
    sendSMS,
    sendOTPSMS,
    sendOrderNotificationSMS,
    isSMSEnabled,
};
