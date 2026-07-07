import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema({
    advertiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    campaign_name: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    
    // Media handling
    media: {
        url: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['image', 'video'],
            default: 'image',
        },
    },
    
    // Call-to-action
    call_to_action: {
        button_text: String,
        destination_url: String,
        action_type: {
            type: String,
            enum: ['link', 'app_link', 'shop', 'contact'],
        },
    },
    
    // Placement configuration
    placement: {
        type: String,
        enum: ['feed', 'search', 'profile', 'all'],
        default: 'all',
    },
    
    // Budget tracking
    budget: {
        total: {
            type: Number,
            required: true,
        },
        spent: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: 'USD',
        },
    },
    
    // Targeting configuration
    targeting: {
        user_roles: [{
            type: String,
            enum: ['consumer', 'artisan', 'trader', 'all'],
        }],
        craft_categories: [String],
        regions: [String],
        demographics: {
            age_min: Number,
            age_max: Number,
        },
    },
    
    // Status and scheduling
    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'completed', 'rejected'],
        default: 'draft',
        index: true,
    },
    
    schedule: {
        start_date: {
            type: Date,
            required: true,
        },
        end_date: {
            type: Date,
            required: true,
        },
    },
    
    // Performance metrics
    metrics: {
        impressions: {
            type: Number,
            default: 0,
        },
        clicks: {
            type: Number,
            default: 0,
        },
        ctr: {
            type: Number,
            default: 0,
        },
        cpc: {
            type: Number,
            default: 0,
        },
    },
}, { timestamps: true });

// Index for queries
advertisementSchema.index({ status: 1, 'schedule.start_date': 1, 'schedule.end_date': 1 });
advertisementSchema.index({ placement: 1, status: 1 });

const Advertisement = mongoose.model('Advertisement', advertisementSchema);
export default Advertisement;
