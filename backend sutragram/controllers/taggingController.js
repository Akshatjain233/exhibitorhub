import Post from '../models/Post.js';
import CraftTag from '../models/CraftTag.js';

// @desc    Apply user-provided tags to content
// @route   POST /api/tagging/auto-tag/:videoId
// @access  Private (artisan only)
export const autoTagContent = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { tag_ids } = req.body;

        if (!Array.isArray(tag_ids) || tag_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tag IDs must be a non-empty array.',
            });
        }

        const video = await Post.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found.',
            });
        }

        // Verify ownership
        if (video.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to tag this content.',
            });
        }

        // Verify all tags exist
        const validTags = await CraftTag.find({ _id: { $in: tag_ids } });
        if (validTags.length !== tag_ids.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more invalid tag IDs.',
            });
        }

        // Add user-provided tags (avoid duplicates)
        const existingTagIds = video.tags.map(t => t.tag.toString());
        const newTags = tag_ids
            .filter(tagId => !existingTagIds.includes(tagId.toString()))
            .map(tagId => ({
                tag: tagId,
                is_ai_generated: false,
            }));

        video.tags = [...video.tags, ...newTags];
        await video.save();

        const populatedVideo = await Post.findById(videoId)
            .populate('tags.tag', 'name_english name_vernacular');

        res.status(200).json({
            success: true,
            message: 'Tags applied successfully.',
            data: {
                video: populatedVideo,
            },
        });
    } catch (error) {
        console.error('Auto-tag content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to auto-tag content.',
            error: error.message,
        });
    }
};

// @desc    Get tag suggestions
// @route   GET /api/tagging/suggestions
// @access  Private
export const suggestTags = async (req, res) => {
    try {
        const { query } = req.query;

        let tags;
        if (query) {
            // Search tags by name
            tags = await CraftTag.find({
                $or: [
                    { name_english: new RegExp(query, 'i') },
                    { name_vernacular: new RegExp(query, 'i') },
                ],
            }).limit(10);
        } else {
            // Return popular tags
            tags = await CraftTag.find().limit(20);
        }

        res.status(200).json({
            success: true,
            data: { tags },
        });
    } catch (error) {
        console.error('Get tag suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tag suggestions.',
            error: error.message,
        });
    }
};

// @desc    Add manual tags to video
// @route   POST /api/tagging/manual/:videoId
// @access  Private (artisan only)
export const addManualTags = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { tag_ids } = req.body;

        if (!Array.isArray(tag_ids)) {
            return res.status(400).json({
                success: false,
                message: 'Tag IDs must be an array.',
            });
        }

        const video = await Post.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found.',
            });
        }

        // Verify ownership
        if (video.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to tag this content.',
            });
        }

        // Verify all tags exist
        const validTags = await CraftTag.find({ _id: { $in: tag_ids } });
        if (validTags.length !== tag_ids.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more invalid tag IDs.',
            });
        }

        // Add new tags (avoid duplicates)
        const existingTagIds = video.tags.map(t => t.tag.toString());
        const newTags = tag_ids
            .filter(tagId => !existingTagIds.includes(tagId.toString()))
            .map(tagId => ({
                tag: tagId,
                is_ai_generated: false,
            }));

        video.tags = [...video.tags, ...newTags];
        await video.save();

        const populatedVideo = await Post.findById(videoId)
            .populate('tags.tag', 'name_english name_vernacular');

        res.status(200).json({
            success: true,
            message: 'Tags added successfully.',
            data: { video: populatedVideo },
        });
    } catch (error) {
        console.error('Add manual tags error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add tags.',
            error: error.message,
        });
    }
};

// @desc    Remove tag from video
// @route   DELETE /api/tagging/:videoId/tag/:tagId
// @access  Private (artisan only)
export const removeTag = async (req, res) => {
    try {
        const { videoId, tagId } = req.params;

        const video = await Post.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found.',
            });
        }

        // Verify ownership
        if (video.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this content.',
            });
        }

        // Remove tag
        video.tags = video.tags.filter(t => t.tag.toString() !== tagId);
        await video.save();

        const populatedVideo = await Post.findById(videoId)
            .populate('tags.tag', 'name_english name_vernacular');

        res.status(200).json({
            success: true,
            message: 'Tag removed successfully.',
            data: { video: populatedVideo },
        });
    } catch (error) {
        console.error('Remove tag error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove tag.',
            error: error.message,
        });
    }
};
