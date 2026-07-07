import mongoose from 'mongoose';

const traderProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },

    // Business Information
    company_name: {
        type: String,
        required: true,
    },
    gst_number: {
        type: String,
        required: true,
    },
    trade_license_number: {
        type: String,
    },
    business_type: {
        type: String,
        enum: ['wholesaler', 'exporter', 'distributor', 'retailer', 'bulk_buyer'],
    },

    // Verification
    is_verified: {
        type: Boolean,
        default: false,
    },
    verification_docs: {
        gst_certificate: String,
        trade_license: String,
        business_proof: String,
    },
    verification_status: {
        type: String,
        enum: ['pending', 'submitted', 'approved', 'rejected'],
        default: 'pending',
    },

    // B2B Portal Access
    is_premium_member: {
        type: Boolean,
        default: false,
    },
    premium_start_date: {
        type: Date,
    },
    premium_end_date: {
        type: Date,
    },

    // Lead Management
    free_leads_used: {
        type: Number,
        default: 0,
    },
    free_leads_limit: {
        type: Number,
        default: 2,
    },
    paid_leads_balance: {
        type: Number,
        default: 0,
    },
    total_leads_accessed: {
        type: Number,
        default: 0,
    },

    // Search Preferences
    interested_craft_types: [{
        type: String, // Art/craft types they're interested in purchasing
    }],
    interested_regions: [{
        type: String, // Geographic regions they source from
    }],

    // Contact & Address
    contact_person_name: {
        type: String,
    },
    contact_designation: {
        type: String,
    },
    business_address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
            type: String,
            default: 'India',
        },
    },

    // Supply-side capabilities for trader material selling
    can_supply_materials: {
        type: Boolean,
        default: false,
    },
    material_types: [{
        type: String, // e.g. 'dyes', 'yarns', 'clay', 'metals', 'tools'
    }],
    operating_regions: [{
        type: String,
    }],

    // Business Metrics
    total_orders_placed: {
        type: Number,
        default: 0,
    },
    total_quotes_requested: {
        type: Number,
        default: 0,
    },
    total_materials_posted: {
        type: Number,
        default: 0,
    },
    leadConversionMetrics: {
        quotes_sent: {
            type: Number,
            default: 0,
        },
        quotes_accepted: {
            type: Number,
            default: 0,
        },
        deals_closed: {
            type: Number,
            default: 0,
        },
        conversion_rate: {
            type: Number,
            default: 0,
        },
    },
}, { timestamps: true });

// Index for search performance
traderProfileSchema.index({ company_name: 'text' });
traderProfileSchema.index({ is_verified: 1 });
traderProfileSchema.index({ is_premium_member: 1 });

const TraderProfile = mongoose.model('TraderProfile', traderProfileSchema);
export default TraderProfile;
