import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        default: 'General',
    },
    availability: {
        type: Boolean,
        default: true,
    },
    stock_quantity: {
        type: Number,
        default: 0,
    },
    is_customizable: {
        type: Boolean,
        default: false,
    },
    customization_options: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    images: {
        type: [String],
        default: [],
    },
    likes_count: {
        type: Number,
        default: 0,
    },
    comments_count: {
        type: Number,
        default: 0,
    },
    shares_count: {
        type: Number,
        default: 0,
    },

    // Bulk order settings (artisan opt-in)
    is_bulk_available: {
        type: Boolean,
        default: false,
    },
    bulk_min_quantity: {
        type: Number,
        default: null,
    },
    bulk_price_per_unit: {
        type: Number,
        default: null,
    },
    bulk_notes: {
        type: String,
        default: '',
        maxlength: 500,
    },
    // Verification (admin-verified products)
    is_verified: {
        type: Boolean,
        default: false,
    },
    verified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    verified_at: {
        type: Date,
    },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
