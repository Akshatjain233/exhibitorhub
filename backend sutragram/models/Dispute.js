import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true,
    },
    raised_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    dispute_type: {
        type: String,
        enum: [
            'product_not_received',
            'product_damaged',
            'product_not_as_described',
            'wrong_item',
            'quality_issue',
            'other',
        ],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    evidence_urls: [
        {
            type: String, // URLs to uploaded images/videos
        },
    ],
    status: {
        type: String,
        enum: ['open', 'under_review', 'resolved', 'rejected', 'closed'],
        default: 'open',
        index: true,
    },
    resolution: {
        type: String,
        enum: ['full_refund', 'partial_refund', 'replacement', 'no_action'],
    },
    resolution_notes: {
        type: String,
    },
    admin_notes: {
        type: String,
    },
    
    // Refund tracking
    refund: {
        amount: Number,
        status: {
            type: String,
            enum: ['pending', 'initiated', 'processed', 'rejected', 'cancelled'],
            default: 'pending',
        },
        transaction_id: String,
        processed_at: Date,
    },
    
    // Timeline tracking
    first_response_at: Date,
    under_review_at: Date,
    resolved_at: Date,
    resolved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    
    // Communication
    consumer_response: String,
    seller_response: String,
    last_updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    last_updated_at: Date,
}, { timestamps: true });

disputeSchema.index({ raised_by: 1, createdAt: -1 });
disputeSchema.index({ status: 1, createdAt: -1 });

const Dispute = mongoose.model('Dispute', disputeSchema);
export default Dispute;
