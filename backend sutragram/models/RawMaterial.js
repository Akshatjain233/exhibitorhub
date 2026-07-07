import mongoose from 'mongoose';

const rawMaterialSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
    },
    description: {
        type: String,
        maxlength: 500,
    },
    price_unit: {
        type: Number,
        required: true,
    },
    is_organic: {
        type: Boolean,
        default: false,
    },
    images: [{
        type: String, // URLs to uploaded images
    }],
    stock_quantity: {
        type: Number,
        default: 0,
    },
    unit: {
        type: String,
        default: 'kg', // kg, meter, piece, etc.
    },
    availability: {
        type: Boolean,
        default: true,
    },
    // Raw materials are posted by trader accounts
    posted_by_role: {
        type: String,
        enum: ['trader'],
        default: 'trader',
    },
}, { timestamps: true });

const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema);
export default RawMaterial;
