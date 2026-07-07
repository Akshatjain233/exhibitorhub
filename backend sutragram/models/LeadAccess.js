import mongoose from 'mongoose';

const leadAccessSchema = new mongoose.Schema({
    trader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    unlocked_at: {
        type: Date,
        default: Date.now,
    },
    relevance_score: {
        type: Number,
    },
    unlocked_from: {
        type: String,
        enum: ['free_limit', 'paid', 'premium'],
        default: 'paid',
    },
    interaction_type: {
        type: String,
        enum: ['view', 'quote_sent', 'contact_requested'],
        default: 'view',
    },
}, { timestamps: true });

leadAccessSchema.index({ trader: 1, artisan: 1 }, { unique: true });
leadAccessSchema.index({ unlocked_at: -1 });

const LeadAccess = mongoose.model('LeadAccess', leadAccessSchema);
export default LeadAccess;
