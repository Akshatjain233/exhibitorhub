import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    last_message: {
        type: String,
        default: '',
    },
    last_message_at: {
        type: Date,
        default: Date.now,
    },
    last_message_sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    unread_count: {
        type: Map,
        of: Number,
        default: {},
    },
    is_archived: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Index for finding conversations by participants
conversationSchema.index({ participants: 1, last_message_at: -1 });

// Method to get unread count for a specific user
conversationSchema.methods.getUnreadCount = function(userId) {
    return this.unread_count.get(userId.toString()) || 0;
};

// Method to reset unread count for a specific user
conversationSchema.methods.resetUnreadCount = function(userId) {
    this.unread_count.set(userId.toString(), 0);
    return this.save();
};

// Method to increment unread count for a user
conversationSchema.methods.incrementUnreadCount = function(userId) {
    const current = this.unread_count.get(userId.toString()) || 0;
    this.unread_count.set(userId.toString(), current + 1);
    return this.save();
};

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
