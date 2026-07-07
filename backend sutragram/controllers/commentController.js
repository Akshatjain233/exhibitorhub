import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { createNotification } from './notificationController.js';

// @desc    Get comments for a video
// @route   GET /api/content/:videoId/comments
// @access  Public
export const getComments = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get top-level comments (no parent_comment)
        const comments = await Comment.find({ 
            video: videoId, 
            parent_comment: null 
        })
            .populate('user', 'name profile_image_url')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ is_pinned: -1, createdAt: -1 });

        const total = await Comment.countDocuments({ 
            video: videoId, 
            parent_comment: null 
        });

        res.status(200).json({
            success: true,
            data: {
                comments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comments.',
            error: error.message,
        });
    }
};

// @desc    Get replies for a comment
// @route   GET /api/comments/:commentId/replies
// @access  Public
export const getReplies = async (req, res) => {
    try {
        const { commentId } = req.params;

        const replies = await Comment.find({ parent_comment: commentId })
            .populate('user', 'name profile_image_url')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            data: { replies },
        });
    } catch (error) {
        console.error('Get replies error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch replies.',
            error: error.message,
        });
    }
};

// @desc    Create a comment
// @route   POST /api/content/:videoId/comments
// @access  Private
export const createComment = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { text, parent_comment } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required.',
            });
        }

        // Verify video exists
        const video = await Post.findById(videoId).populate('artisan', 'name');
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found.',
            });
        }

        // Create comment
        const comment = await Comment.create({
            video: videoId,
            user: req.user._id,
            text: text.trim(),
            parent_comment: parent_comment || null,
        });

        // Update video comments count
        if (!parent_comment) {
            video.comments_count = (video.comments_count || 0) + 1;
            await video.save();
        }

        // Create notification for video creator (if not commenting on own video)
        if (video.artisan._id.toString() !== req.user._id.toString()) {
            const io = req.app.get('io');
            await createNotification({
                user: video.artisan._id,
                category: 'comment',
                title: 'New Comment',
                message: `${req.user.name} commented on your video`,
                actor: req.user._id,
                related_entity: {
                    entity_type: 'video',
                    entity_id: video._id,
                },
            }, io);
        }

        // Populate user info
        await comment.populate('user', 'name profile_image_url');

        res.status(201).json({
            success: true,
            data: { comment },
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create comment.',
            error: error.message,
        });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found.',
            });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment.',
            });
        }

        // Delete comment
        await Comment.findByIdAndDelete(commentId);

        // Update video comments count
        if (!comment.parent_comment) {
            await Post.findByIdAndUpdate(comment.video, {
                $inc: { comments_count: -1 },
            });
        }

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully.',
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete comment.',
            error: error.message,
        });
    }
};

// @desc    Like a comment
// @route   POST /api/comments/:commentId/like
// @access  Private
export const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found.',
            });
        }

        comment.likes_count += 1;
        await comment.save();

        res.status(200).json({
            success: true,
            data: { likes_count: comment.likes_count },
        });
    } catch (error) {
        console.error('Like comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like comment.',
            error: error.message,
        });
    }
};
