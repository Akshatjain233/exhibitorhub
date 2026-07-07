import mongoose from 'mongoose';

const b2bOrderSchema = new mongoose.Schema({
    // order_type distinguishes raw-material orders from bulk product orders
    order_type: {
        type: String,
        enum: ['material', 'product_bulk'],
        default: 'material',
    },
    trader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // seller & material are only populated for order_type === 'material'
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RawMaterial',
        default: null,
    },
    material_name: {
        type: String,
        default: '',
    },
    // product & artisan are only populated for order_type === 'product_bulk'
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
    },
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    unit: {
        type: String,
        default: 'unit',
    },
    unit_price: {
        type: Number,
        required: true,
        min: 0,
    },
    total_price: {
        type: Number,
        required: true,
        min: 0,
    },
    delivery_address: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'processing', 'shipped', 'delivered', 'rejected', 'cancelled'],
        default: 'pending',
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'completed', 'failed'],
        default: 'pending',
    },
    payment_method: {
        type: String,
        enum: ['upi', 'card', 'bank_transfer', 'pending'],
        default: 'pending',
    },
    notes: {
        type: String,
        maxlength: 500,
        default: '',
    },
    seller_response: {
        type: String,
        maxlength: 500,
        default: '',
    },
    delivery_timeline: {
        type: String,
        default: '',
    },
    agreed_price: {
        type: Number,
    },
}, { timestamps: true });

// Indexes for performance
b2bOrderSchema.index({ trader: 1 });
b2bOrderSchema.index({ seller: 1 });
b2bOrderSchema.index({ material: 1 });
b2bOrderSchema.index({ status: 1 });

const B2BOrder = mongoose.model('B2BOrder', b2bOrderSchema);
export default B2BOrder;
