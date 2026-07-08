import mongoose from 'mongoose';

const artisanProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    bio_text: {
        type: String,
        maxlength: 2000,
    },
    bio_audio_url: {
        type: String,
    },
    location_gps: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            required: function () {
                return this.location_gps && this.location_gps.type;
            }
        }
    },
    location_city: {
        type: String,
    },
    location_state: {
        type: String,
    },
    location_region: {
        type: String,
    },
    craft_tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CraftTag',
    }],
    craft_specialization: {
        type: String,
    },
    is_verified: {
        type: Boolean,
        default: false,
    },
    verification_status: {
        type: String,
        enum: ['pending', 'submitted', 'approved', 'rejected'],
        default: 'pending',
    },
    verification_docs: {
        type: Object,
    },
    verification_date: {
        type: Date,
    },
    rating_avg: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    rating_count: {
        type: Number,
        default: 0,
    },
    payment_upi_id: {
        type: String,
    },
    payment_account_verified: {
        type: Boolean,
        default: false,
    },
    bank_account_number: {
        type: String,
    },
    bank_ifsc_code: {
        type: String,
    },
    total_views: {
        type: Number,
        default: 0,
    },
    total_likes: {
        type: Number,
        default: 0,
    },
    total_shares: {
        type: Number,
        default: 0,
    },
    last_active_at: {
        type: Date,
        default: Date.now,
    },
    is_stale: {
        type: Boolean,
        default: false,
    },
    stale_marked_at: {
        type: Date,
    },
    followers_count: {
        type: Number,
        default: 0,
    },
    following_count: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

artisanProfileSchema.index({ is_verified: 1 });
artisanProfileSchema.index({ location_city: 1, location_state: 1 });
artisanProfileSchema.index({ craft_tags: 1 });
artisanProfileSchema.index({ rating_avg: -1 });
artisanProfileSchema.index({ verification_status: 1 });
artisanProfileSchema.index({ is_stale: 1, updatedAt: -1 });
artisanProfileSchema.index({ location_gps: '2dsphere' });

const ArtisanProfile = mongoose.model('ArtisanProfile', artisanProfileSchema);
export default ArtisanProfile;
