import mongoose from 'mongoose';

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
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
    message_type: {
        type: String,
        enum: ['text', 'image', 'voice', 'quote'],
        default: 'text',
    },
    content: {
        type: String, // Text or URL for media
    },
    quote_data: {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity: Number,
        price: Number,
        customization_details: String,
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    read_at: Date,
}, { timestamps: true });

// Indexes
chatMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
