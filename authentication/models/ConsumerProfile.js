import mongoose from 'mongoose';

const consumerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    selected_interests: [{
        type: String,
    }],
    craft_preferences: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CraftTag',
    }],
    interest_vector: {
        type: Object,
    },
    recently_viewed: [{
        content_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',
        },
        viewed_at: {
            type: Date,
            default: Date.now,
        },
    }],
    liked_content: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
    }],
    saved_content: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
    }],
    followed_artisans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ArtisanProfile',
    }],
    addresses: [{
        label: String,
        full_address: String,
        city: String,
        state: String,
        pincode: String,
        is_default: Boolean,
    }],
}, { timestamps: true });

consumerProfileSchema.index({ craft_preferences: 1 });
consumerProfileSchema.index({ followed_artisans: 1 });

const ConsumerProfile = mongoose.model('ConsumerProfile', consumerProfileSchema);
export default ConsumerProfile;
