import mongoose from 'mongoose';

const supplierProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    business_name: {
        type: String,
        required: true,
        trim: true,
    },
    gst_number: {
        type: String,
        trim: true,
    },
    business_type: {
        type: String,
        enum: ['manufacturer', 'distributor', 'wholesaler', 'raw_material_supplier'],
        default: 'raw_material_supplier',
    },
    operating_regions: [{
        type: String,
        trim: true,
    }],
    material_types: [{
        type: String,
        trim: true,
    }],
    is_verified: {
        type: Boolean,
        default: false,
    },
    verification_docs: {
        gst_certificate: String,
        business_license: String,
        business_proof: String,
    },
    verification_status: {
        type: String,
        enum: ['pending', 'submitted', 'approved', 'rejected'],
        default: 'pending',
    },
    is_premium: {
        type: Boolean,
        default: false,
    },
    premium_start_date: {
        type: Date,
    },
    premium_end_date: {
        type: Date,
    },
    lead_credits_balance: {
        type: Number,
        default: 2,
        min: 0,
    },
    total_leads_accessed: {
        type: Number,
        default: 0,
    },
    leads_monthly_limit: {
        type: Number,
        default: 2,
        min: 0,
    },
    leads_accessed_this_month: {
        type: Number,
        default: 0,
        min: 0,
    },
    contact_person_name: {
        type: String,
        trim: true,
    },
    contact_designation: {
        type: String,
        trim: true,
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
    total_materials_listed: {
        type: Number,
        default: 0,
    },
    conversion_rate: {
        type: Number,
        default: 0,
    },
    average_lead_quality_score: {
        type: Number,
        default: 0,
    },
    lead_performance_metrics: {
        total_quotes_sent: {
            type: Number,
            default: 0,
        },
        total_quotes_accepted: {
            type: Number,
            default: 0,
        },
        total_orders_closed: {
            type: Number,
            default: 0,
        },
        quote_acceptance_rate: {
            type: Number,
            default: 0,
        },
        avg_quote_response_time_hours: {
            type: Number,
            default: 0,
        },
    },
    last_active_date: {
        type: Date,
        default: Date.now,
    },
    creditTransactions: [{
        date: {
            type: Date,
            default: Date.now,
        },
        credit_change: {
            type: Number,
            required: true,
        },
        balance_after: {
            type: Number,
        },
        action: {
            type: String,
            enum: ['unlock', 'purchase', 'bonus', 'monthly_reset', 'adjustment'],
            required: true,
        },
        lead_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        metadata: {
            type: Object,
            default: {},
        },
    }],
    email_on_new_leads: {
        type: Boolean,
        default: true,
    },
    sms_on_new_leads: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

supplierProfileSchema.index({ is_premium: 1, createdAt: -1 });
supplierProfileSchema.index({ 'creditTransactions.date': -1 });

const SupplierProfile = mongoose.model('SupplierProfile', supplierProfileSchema);
export default SupplierProfile;
