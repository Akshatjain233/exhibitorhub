// This controller is primarily handled by contentController.js uploadContent
// But we can add some utility functions here

import Post from '../models/Post.js';
import { createNotification } from './notificationController.js';

// @desc    Check upload status
// @route   GET /api/upload/status/:videoId
// @access  Private (artisan only)
export const checkUploadStatus = async (req, res) => {
    try {
        const { videoId } = req.params;

        const video = await Post.findOne({
            _id: videoId,
            artisan: req.user._id,
        });

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found.',
            });
        }

        // In production, check processing status from video processing queue
        const status = {
            uploaded: true,
            processing: false,
            ready: true,
            url: video.video_url_1080p,
        };

        res.status(200).json({
            success: true,
            data: { status },
        });
    } catch (error) {
        console.error('Check upload status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check upload status.',
            error: error.message,
        });
    }
};

// @desc    Notify upload complete (webhook endpoint for processing service)
// @route   POST /api/upload/notify/:videoId
// @access  Private (system only)
export const notifyUploadComplete = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { processed_urls } = req.body;

        const video = await Post.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found.',
            });
        }

        // Update video URLs if processing completed
        if (processed_urls) {
            video.video_url_720p = processed_urls['720p'] || video.video_url_720p;
            video.video_url_480p = processed_urls['480p'] || video.video_url_480p;
            await video.save();
        }

        // Notify artisan
        await createNotification(
            video.artisan,
            'push',
            'upload_complete',
            'Upload Complete',
            'Your video has been processed and is now live!',
            { videoId }
        );

        res.status(200).json({
            success: true,
            message: 'Upload notification processed.',
        });
    } catch (error) {
        console.error('Notify upload complete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process upload notification.',
            error: error.message,
        });
    }
};
