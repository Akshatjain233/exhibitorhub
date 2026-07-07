import Post from '../models/Post.js';
import ConsumerProfile from '../models/ConsumerProfile.js';

// @desc    Get content recommendations
// @route   GET /api/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Basic recommendation algorithm
        // In production, this would use ML models and user behavior analysis
        let recommendedPosts;

        if (req.user.role === 'consumer') {
            const consumerProfile = await ConsumerProfile.findOne({ user: req.user._id });

            if (consumerProfile) {
                // Get videos from followed artisans
                const followedArtisanPosts = await Post.find({
                    artisan: { $in: consumerProfile.followed_artisans }
                })
                    .populate('artisan', 'name')
                    .populate('tags.tag', 'name_english name_vernacular')
                    .limit(parseInt(limit) / 2)
                    .sort({ createdAt: -1 });

                // Get videos matching preferences
                const preferencePosts = await Post.find({
                    'tags.tag': { $in: consumerProfile.craft_preferences },
                    artisan: { $nin: consumerProfile.followed_artisans }
                })
                    .populate('artisan', 'name')
                    .populate('tags.tag', 'name_english name_vernacular')
                    .limit(parseInt(limit) / 2)
                    .sort({ view_count: -1 });

                recommendedPosts = [...followedArtisanPosts, ...preferencePosts];
            } else {
                // Fallback to trending
                recommendedPosts = await Post.find()
                    .populate('artisan', 'name')
                    .populate('tags.tag', 'name_english name_vernacular')
                    .skip(skip)
                    .limit(parseInt(limit))
                    .sort({ view_count: -1 });
            }
        } else {
            // For non-consumers, return popular content
            recommendedPosts = await Post.find()
                .populate('artisan', 'name')
                .populate('tags.tag', 'name_english name_vernacular')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ view_count: -1 });
        }

        res.status(200).json({
            success: true,
            data: {
                recommendations: recommendedPosts,
            },
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recommendations.',
            error: error.message,
        });
    }
};

// @desc    Track user interaction for recommendation engine
// @route   POST /api/recommendations/track
// @access  Private
export const trackInteraction = async (req, res) => {
    try {
        const { videoId, interactionType, watchTime } = req.body;

        if (!videoId || !interactionType) {
            return res.status(400).json({
                success: false,
                message: 'Video ID and interaction type are required.',
            });
        }

        // Validate interaction type
        const validTypes = ['view', 'like', 'share', 'watch_complete', 'skip'];
        if (!validTypes.includes(interactionType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid interaction type.',
            });
        }

        // In production, store this in a separate interaction tracking collection
        // For now, we'll update the consumer profile preferences based on the video tags
        const video = await Post.findById(videoId).populate('tags.tag');

        if (video && req.user.role === 'consumer') {
            const consumerProfile = await ConsumerProfile.findOne({ user: req.user._id });

            if (consumerProfile && interactionType === 'like') {
                // Add video tags to preferences if not already there
                const tagIds = video.tags.map(t => t.tag._id);
                const newPreferences = [...new Set([...consumerProfile.craft_preferences, ...tagIds])];
                consumerProfile.craft_preferences = newPreferences;
                await consumerProfile.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Interaction tracked successfully.',
        });
    } catch (error) {
        console.error('Track interaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track interaction.',
            error: error.message,
        });
    }
};

// @desc    Update user preference profile
// @route   POST /api/recommendations/update-preferences
// @access  Private (consumer only)
export const updatePreferenceProfile = async (req, res) => {
    try {
        const { craft_preferences } = req.body;

        if (!Array.isArray(craft_preferences)) {
            return res.status(400).json({
                success: false,
                message: 'Craft preferences must be an array.',
            });
        }

        const consumerProfile = await ConsumerProfile.findOneAndUpdate(
            { user: req.user._id },
            { craft_preferences },
            { new: true }
        ).populate('craft_preferences', 'name_english name_vernacular');

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully.',
            data: { preferences: consumerProfile.craft_preferences },
        });
    } catch (error) {
        console.error('Update preference profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences.',
            error: error.message,
        });
    }
};
