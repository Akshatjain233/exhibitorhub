import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
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
        ref: 'Comment',
        default: null, // For replies
    },
    is_pinned: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Index for efficient queries
commentSchema.index({ video: 1, createdAt: -1 });
commentSchema.index({ parent_comment: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
