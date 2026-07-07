import Post from '../models/Post.js';
import ModerationFlag from '../models/ModerationFlag.js';
import { deleteSpacesObject } from '../config/s3.js';
import { createNotification } from './notificationController.js';

// @desc    Flag content for review
// @route   POST /api/moderation/flag/:videoId
// @access  Private
export const flagContent = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { reason, description } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason is required.',
            });
        }

        const video = await Post.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Content not found.',
            });
        }

        // Persist moderation flag
        await ModerationFlag.create({
            video: videoId,
            reportedBy: req.user._id,
            reason,
            description: description || '',
        });

        res.status(200).json({
            success: true,
            message: 'Content flagged for review successfully.',
        });
    } catch (error) {
        console.error('Flag content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to flag content.',
            error: error.message,
        });
    }
};

// @desc    Get flagged content
// @route   GET /api/moderation/flagged
// @access  Private (admin only)
export const getFlaggedContent = async (req, res) => {
    try {
        const { status = 'pending' } = req.query;

        const enriched = await ModerationFlag.find({ status })
            .populate({
                path: 'video',
                populate: { path: 'artisan', select: 'name email' },
            })
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { flaggedContent: enriched },
        });
    } catch (error) {
        console.error('Get flagged content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch flagged content.',
            error: error.message,
        });
    }
};

// @desc    Remove content
// @route   DELETE /api/moderation/remove/:videoId
// @access  Private (admin only)
export const removeContent = async (req, res) => {
    try {
        const { videoId, id } = req.params;
        const resolvedVideoId = videoId || id;
        const { reason } = req.body;

        const video = await Post.findById(resolvedVideoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Content not found.',
            });
        }

        // Notify artisan
        await createNotification(
            video.artisan,
            'in_app',
            'general',
            'Content Removed',
            reason || 'Your content was removed due to policy violation.',
            { videoId: resolvedVideoId }
        );

        const urlsToDelete = [
            video.media_url,
            video.video_url_original,
            video.video_url_1080p,
            video.video_url_720p,
            video.video_url_480p,
            video.url_high_res,
            video.url_low_bw,
            video.thumbnail_url,
        ].filter(Boolean);

        const uniqueUrls = [...new Set(urlsToDelete)];
        await Promise.all(uniqueUrls.map((url) => deleteSpacesObject(url)));

        // Delete video
        await Post.findByIdAndDelete(resolvedVideoId);

        // Update moderation flags for this content
        await ModerationFlag.updateMany(
            { video: resolvedVideoId, status: 'pending' },
            {
                $set: {
                    status: 'removed',
                    reviewedAt: new Date(),
                    reviewedBy: req.user._id,
                },
            }
        );

        res.status(200).json({
            success: true,
            message: 'Content removed successfully.',
        });
    } catch (error) {
        console.error('Remove content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove content.',
            error: error.message,
        });
    }
};

// @desc    Approve content (dismiss flag)
// @route   PUT /api/moderation/approve/:videoId
// @access  Private (admin only)
export const approveContent = async (req, res) => {
    try {
        const { videoId, id } = req.params;
        const resolvedVideoId = videoId || id;

        const video = await Post.findById(resolvedVideoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Content not found.',
            });
        }

        // Update moderation flags for this content
        await ModerationFlag.updateMany(
            { video: resolvedVideoId, status: 'pending' },
            {
                $set: {
                    status: 'approved',
                    reviewedAt: new Date(),
                    reviewedBy: req.user._id,
                },
            }
        );

        res.status(200).json({
            success: true,
            message: 'Content approved successfully.',
        });
    } catch (error) {
        console.error('Approve content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve content.',
            error: error.message,
        });
    }
};

// @desc    Handle appeal
// @route   POST /api/moderation/appeal/:videoId
// @access  Private (artisan only)
export const handleAppeal = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { appeal_reason } = req.body;

        if (!appeal_reason) {
            return res.status(400).json({
                success: false,
                message: 'Appeal reason is required.',
            });
        }

        // In production, create an Appeal model entry
        console.log(`Appeal submitted for video ${videoId}: ${appeal_reason}`);

        res.status(200).json({
            success: true,
            message: 'Appeal submitted successfully. Admin will review.',
        });
    } catch (error) {
        console.error('Handle appeal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to handle appeal.',
            error: error.message,
        });
    }
};
