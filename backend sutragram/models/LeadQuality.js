import mongoose from 'mongoose';

const leadQualitySchema = new mongoose.Schema({
    lead_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    supplier_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    score_breakdown: {
        rating: {
            type: Number,
            default: 0,
        },
        engagement: {
            type: Number,
            default: 0,
        },
        region_bonus: {
            type: Number,
            default: 0,
        },
        freshness: {
            type: Number,
            default: 0,
        },
        activity: {
            type: Number,
            default: 0,
        },
        conversion: {
            type: Number,
            default: 0,
        },
    },
    final_score: {
        type: Number,
        required: true,
    },
    quality_tier: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
    },
    computed_at: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, { timestamps: true });

leadQualitySchema.index({ lead_id: 1, supplier_id: 1, computed_at: -1 });

const LeadQuality = mongoose.model('LeadQuality', leadQualitySchema);
export default LeadQuality;
