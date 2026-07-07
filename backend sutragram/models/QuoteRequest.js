import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    requester_type: {
        type: String,
        enum: ['trader', 'artisan', 'consumer', 'supplier'],
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    recipient_type: {
        type: String,
        enum: ['artisan', 'trader', 'consumer', 'supplier'],
        required: true,
    },
    // Item being quoted
    item: {
        item_type: {
            type: String,
            enum: ['raw_material', 'bulk_raw_material', 'product', 'service', 'lead'],
            required: true,
        },
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'item.item_ref_model',
        },
        item_ref_model: {
            type: String,
            enum: ['RawMaterial', 'Product', 'User'],
        },
        item_name: {
            type: String,
            required: true,
        },
        lead_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        lead_context: {
            source: {
                type: String,
                enum: ['supplier_leads', 'trader_leads', 'direct', 'other'],
                default: 'other',
            },
            quality_score_at_request: {
                type: Number,
            },
        },
    },
    // Quote request details
    quantity: {
        type: Number,
        min: 1,
    },
    message: {
        type: String,
        maxlength: 1000,
    },
    // Quote response
    status: {
        type: String,
        enum: ['pending', 'responded', 'accepted', 'rejected', 'expired', 'cancelled'],
        default: 'pending',
        index: true,
    },
    quote_response: {
        price_per_unit: {
            type: Number,
        },
        total_price: {
            type: Number,
        },
        delivery_timeline: {
            type: String, // e.g., "7-10 days", "2 weeks"
        },
        terms: {
            type: String,
            maxlength: 1000,
        },
        responded_at: {
            type: Date,
        },
        response_time_hours: {
            type: Number,
        },
    },
    // Acceptance/rejection details
    accepted_at: {
        type: Date,
    },
    rejected_at: {
        type: Date,
    },
    rejection_reason: {
        type: String,
        maxlength: 500,
    },
    cancelled_at: {
        type: Date,
    },
    cancellation_reason: {
        type: String,
        maxlength: 500,
    },
    expires_at: {
        type: Date,
        index: true,
    },
    // Conversion tracking
    converted_to_order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
}, { timestamps: true });

// Indexes for performance
quoteRequestSchema.index({ requester: 1, status: 1 });
quoteRequestSchema.index({ recipient: 1, status: 1 });
quoteRequestSchema.index({ createdAt: -1 });
quoteRequestSchema.index({ 'item.lead_id': 1, status: 1 });

// Virtual for checking if expired
quoteRequestSchema.virtual('is_expired').get(function() {
    return this.expires_at && this.expires_at < new Date() && this.status === 'pending';
});

const QuoteRequest = mongoose.model('QuoteRequest', quoteRequestSchema);
export default QuoteRequest;
