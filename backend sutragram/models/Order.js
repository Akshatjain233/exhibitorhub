import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    consumer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: {
        type: [{
            product: {
                type: mongoose.Schema.Types.Mixed, // Allows ObjectId or string (for tests)
                ref: 'Product',
            },
            quantity: { type: Number, default: 1 },
            price: { type: Number },
            price_at_purchase: { type: Number },
        }],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Order must have at least one item',
        },
    },
    subtotal: {
        type: Number,
        default: 0,
    },
    delivery_charges: {
        type: Number,
        default: 0,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    order_status: {
        type: String,
        enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled', 'disputed'],
        default: 'placed',
    },
    tracking_id: {
        type: String,
    },
    delivery_address: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    delivery_otp_hash: {
        type: String,
    },
    delivery_otp: {
        type: String,
        maxlength: 6,
    },
    razorpay_order_id: {
        type: String,
    },
    razorpay_payment_id: {
        type: String,
    },
    razorpay_signature: {
        type: String,
    },
    customer_note: {
        type: String,
        maxlength: 500,
        default: '',
    },
    artisan_note: {
        type: String,
        maxlength: 500,
        default: '',
    },
}, { timestamps: true });

// Require at least 1 item via path-level validator

// Indexes for performance
orderSchema.index({ consumer: 1 });
orderSchema.index({ artisan: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
