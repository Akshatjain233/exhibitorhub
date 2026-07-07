import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        maxLength: 2000,
    },
    type: {
        type: String,
        enum: ['text', 'image', 'audio', 'video', 'file', 'quote'],
        default: 'text',
    },
    media_url: {
        type: String,
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    read_at: {
        type: Date,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    quote_details: {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity: Number,
        price: Number,
        notes: String,
    },
}, { timestamps: true });

// Index for efficient message queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ is_read: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
