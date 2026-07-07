import { processVideo } from '../services/videoService.js';
import Post from '../models/Post.js';

// @desc    Process uploaded video (generate thumbnail, compress)
// @route   POST /api/media/process-upload
// @access  Private
export const processUploadedVideo = async (req, res) => {
    try {
        const { videoUrl, contentId } = req.body;

        if (!videoUrl || !contentId) {
            return res.status(400).json({
                success: false,
                message: 'videoUrl and contentId are required.',
            });
        }

        // Process video in background
        const processed = await processVideo(videoUrl, req.user._id.toString());

        // Update video record
        const content = await Post.findById(contentId);
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found.',
            });
        }

        content.video_url_1080p = processed.processedUrl;
        content.thumbnail_url = processed.thumbnailUrl;
        content.duration = Math.round(processed.metadata.duration);
        await content.save();

        res.status(200).json({
            success: true,
            message: 'Video processed successfully.',
            data: {
                videoUrl: processed.processedUrl,
                thumbnailUrl: processed.thumbnailUrl,
                metadata: processed.metadata,
            },
        });
    } catch (error) {
        console.error('Process video error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process video.',
            error: error.message,
        });
    }
};

// @desc    Get upload progress (TUS)
// @route   GET /api/media/upload-progress/:uploadId
// @access  Private
export const getUploadProgress = async (req, res) => {
    try {
        const { uploadId } = req.params;

        // TUS server handles this internally
        // This endpoint is for client polling if needed
        res.status(200).json({
            success: true,
            message: 'Upload progress tracking via TUS HEAD request',
        });
    } catch (error) {
        console.error('Get upload progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get upload progress.',
            error: error.message,
        });
    }
};
