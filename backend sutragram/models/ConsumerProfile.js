import mongoose from 'mongoose';

const consumerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },

    // Onboarding Preferences
    selected_interests: [{
        type: String, // Craft categories: Home Decor, Handloom, Jewelry, Pottery, etc.
    }],
    craft_preferences: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CraftTag',
    }],

    // Recommendation Engine Data
    interest_vector: {
        type: Object, // JSON structure for ML-based preferences
    },

    // Browsing History
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

    // Interaction Tracking
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

    // Delivery Addresses
    addresses: [{
        label: String, // "Home", "Office", etc.
        full_address: String,
        city: String,
        state: String,
        pincode: String,
        is_default: Boolean,
    }],
}, { timestamps: true });

// Indexes for performance
// Note: user field has unique:true which already creates an index
consumerProfileSchema.index({ craft_preferences: 1 });
consumerProfileSchema.index({ followed_artisans: 1 });

const ConsumerProfile = mongoose.model('ConsumerProfile', consumerProfileSchema);
export default ConsumerProfile;
