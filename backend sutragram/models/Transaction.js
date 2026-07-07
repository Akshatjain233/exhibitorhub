import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    related_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    type: {
        type: String,
        enum: [
            'Inbound',
            'Outbound',
            'Refund',
            'workshop_payment',
            'workshop_payout',
            'workshop_refund',
            'platform_fee',
        ],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    platform_fee: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'hold', 'completed', 'failed'],
        default: 'completed',
    },
    description: {
        type: String,
    },
    processed_at: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Indexes for performance
transactionSchema.index({ user: 1 });
transactionSchema.index({ related_user: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
