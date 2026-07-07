import mongoose from 'mongoose';

const consentLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    consent_type: {
        type: String,
        enum: ['terms_and_conditions', 'privacy_policy', 'data_processing', 'marketing'],
        required: true,
    },
    consent_given: {
        type: Boolean,
        required: true,
        default: false,
    },
    ip_address: {
        type: String,
    },
    user_agent: {
        type: String,
    },
    consent_version: {
        type: String, // e.g., "v1.0", "v2.0" to track policy changes
    },
    revoked_at: {
        type: Date,
    },
}, { timestamps: true });

// Index for efficient querying
consentLogSchema.index({ user: 1, consent_type: 1 });
consentLogSchema.index({ createdAt: -1 });

const ConsentLog = mongoose.model('ConsentLog', consentLogSchema);
export default ConsentLog;
