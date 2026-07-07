const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
    },
    lastMessageAt: {
        type: Date,
        default: null,
    },
    unreadCounts: {
        type: Map,
        of: Number,
        default: {},
    },
    archivedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    mutedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

chatSchema.index({ participants: 1, lastMessageAt: -1 });
chatSchema.index({ participants: 1 });

chatSchema.methods.getOtherParticipant = function(userId) {
    return this.participants.find(id => id.toString() !== userId.toString());
};

chatSchema.methods.getUnreadCount = function(userId) {
    return this.unreadCounts.get(userId.toString()) || 0;
};

chatSchema.methods.incrementUnreadCount = function(userId) {
    const current = this.unreadCounts.get(userId.toString()) || 0;
    this.unreadCounts.set(userId.toString(), current + 1);
    return this.save();
};

chatSchema.methods.resetUnreadCount = function(userId) {
    this.unreadCounts.set(userId.toString(), 0);
    return this.save();
};

chatSchema.methods.isMutedFor = function(userId) {
    return this.mutedBy.some(id => id.toString() === userId.toString());
};

chatSchema.methods.isArchivedFor = function(userId) {
    return this.archivedBy.some(id => id.toString() === userId.toString());
};

module.exports = mongoose.model('Chat', chatSchema);
