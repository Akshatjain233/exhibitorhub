import ArtisanProfile from '../models/ArtisanProfile.js';
import Post from '../models/Post.js';

// @desc    Share content (increment share count)
// @route   POST /api/share/video/:videoId
// @access  Public
export const shareVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { platform } = req.body; // whatsapp, facebook, twitter, etc.

        const video = await Post.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found.',
            });
        }

        // Increment artisan's total shares
        await ArtisanProfile.findOneAndUpdate(
            { user: video.artisan },
            { $inc: { total_shares: 1 } }
        );

        // Track share analytics (in production, store detailed share data)
        console.log(`Video ${videoId} shared on ${platform}`);

        res.status(200).json({
            success: true,
            message: 'Share tracked successfully.',
        });
    } catch (error) {
        console.error('Share video error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track share.',
            error: error.message,
        });
    }
};

// @desc    Generate share link
// @route   GET /api/share/link/:videoId
// @access  Public
export const generateShareLink = async (req, res) => {
    try {
        const { videoId } = req.params;

        const video = await Post.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found.',
            });
        }

        // Generate shareable link
        const shareLink = `${process.env.APP_URL || 'https://sutagram.com'}/video/${videoId}`;

        res.status(200).json({
            success: true,
            data: {
                shareLink,
                title: video.description || 'Check out this amazing craft!',
            },
        });
    } catch (error) {
        console.error('Generate share link error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate share link.',
            error: error.message,
        });
    }
};
