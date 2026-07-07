import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Get configured Razorpay instance
 * @returns {Razorpay} Razorpay instance
 */
export const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SLYAr0QqnA1HkO',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'xJ33fwHiO2yHjqx9sa5QzVEn',
    });
};

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in rupees (will be converted to paise)
 * @param {string} receipt - Receipt identifier
 * @param {Object} notes - Additional notes/metadata
 * @returns {Promise<Object>} Razorpay order object
 */
export const createRazorpayOrder = async (amount, receipt, notes = {}) => {
    const razorpay = getRazorpayInstance();
    return await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt,
        notes,
    });
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature to verify
 * @returns {boolean} True if signature is valid
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'xJ33fwHiO2yHjqx9sa5QzVEn';
    const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
    
    return generatedSignature === signature;
};
