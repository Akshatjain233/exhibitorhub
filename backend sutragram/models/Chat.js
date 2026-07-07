import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    // Exactly 2 participants for 1-on-1 messaging
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],

    // Reference to the last message for quick access
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
    },

    // Timestamp of the last message
    lastMessageAt: {
        type: Date,
        default: null,
    },

    // Track unread message counts per participant
    unreadCounts: {
        type: Map,
        of: Number,
        default: {},
    },

    // Archive status for individual participants
    archivedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    // Whether the conversation is muted
    mutedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

// Compound index for fast querying by two participants
// This ensures efficient lookup of a 1-on-1 chat between any two users
chatSchema.index({ participants: 1, lastMessageAt: -1 });
chatSchema.index({ participants: 1 });

// Helper method to get the other participant
chatSchema.methods.getOtherParticipant = function(userId) {
    return this.participants.find(id => id.toString() !== userId.toString());
};

// Helper method to get unread count for a specific user
chatSchema.methods.getUnreadCount = function(userId) {
    return this.unreadCounts.get(userId.toString()) || 0;
};

// Helper method to increment unread count for a user
chatSchema.methods.incrementUnreadCount = function(userId) {
    const current = this.unreadCounts.get(userId.toString()) || 0;
    this.unreadCounts.set(userId.toString(), current + 1);
    return this.save();
};

// Helper method to reset unread count for a user
chatSchema.methods.resetUnreadCount = function(userId) {
    this.unreadCounts.set(userId.toString(), 0);
    return this.save();
};

// Helper method to check if chat is muted for a user
chatSchema.methods.isMutedFor = function(userId) {
    return this.mutedBy.some(id => id.toString() === userId.toString());
};

// Helper method to check if chat is archived for a user
chatSchema.methods.isArchivedFor = function(userId) {
    return this.archivedBy.some(id => id.toString() === userId.toString());
};

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
