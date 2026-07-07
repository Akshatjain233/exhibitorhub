import mongoose from 'mongoose';

const productCommentSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxlength: 500,
    },
    likes_count: {
        type: Number,
        default: 0,
    },
    parent_comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductComment',
        default: null,
    },
    is_pinned: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

productCommentSchema.index({ product: 1, createdAt: -1 });
productCommentSchema.index({ parent_comment: 1 });

const ProductComment = mongoose.model('ProductComment', productCommentSchema);
export default ProductComment;
