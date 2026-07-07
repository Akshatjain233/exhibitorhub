import mongoose from 'mongoose';

const growthFundApplicationSchema = new mongoose.Schema({
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    business_name: {
        type: String,
        required: true,
    },
    amount_requested: {
        type: Number,
        required: true,
        min: 0,
    },
    purpose: {
        type: String,
        required: true,
        enum: [
            'equipment_purchase',
            'raw_materials',
            'skill_training',
            'workshop_setup',
            'marketing',
            'business_expansion',
            'other'
        ],
    },
    purpose_description: {
        type: String,
        required: true,
        maxlength: 1000,
    },
    current_monthly_revenue: {
        type: Number,
        default: 0,
    },
    expected_impact: {
        type: String,
        maxlength: 500,
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'disbursed'],
        default: 'pending',
    },
    admin_notes: {
        type: String,
        maxlength: 1000,
    },
    reviewed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewed_at: {
        type: Date,
    },
    approved_amount: {
        type: Number,
        min: 0,
    },
    disbursement_date: {
        type: Date,
    },
    disbursement_method: {
        type: String,
        enum: ['bank_transfer', 'upi', 'cheque'],
    },
    disbursement_reference: {
        type: String,
    },
    supporting_documents: [{
        url: String,
        type: String, // 'invoice', 'estimate', 'business_plan', etc.
        uploaded_at: {
            type: Date,
            default: Date.now,
        },
    }],
}, {
    timestamps: true,
});

// Indexes for efficient queries
growthFundApplicationSchema.index({ artisan: 1, createdAt: -1 });
growthFundApplicationSchema.index({ status: 1, createdAt: -1 });

const GrowthFundApplication = mongoose.model('GrowthFundApplication', growthFundApplicationSchema);

export default GrowthFundApplication;
