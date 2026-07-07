import Post from '../models/Post.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import mongoose from 'mongoose';
import { deleteSpacesObject } from '../config/s3.js';
import { createNotification } from './notificationController.js';
import { trackPostView, trackPostLike, trackPostShare } from '../services/analyticsService.js';

// @desc    Create content (without file upload initially)
// @route   POST /api/content/create
// @access  Private (artisan only)
export const createContent = async (req, res) => {
    try {
        const { title, description, media_url, type, craft_tags } = req.body;

        if (!title || !media_url) {
            return res.status(400).json({
                success: false,
                message: 'Title and media URL are required.',
            });
        }

        // Create video/content record
        const videoData = {
            artisan: req.user._id,
            content_type: type || 'video',
            media_url,
            video_url_original: media_url,
            video_url_1080p: media_url, // Will be replaced after transcoding
            video_url_720p: media_url,
            video_url_480p: media_url,
            description: description || '',
            title: title,
            duration: 0, // Will be updated after processing
            thumbnail_url: media_url, // Placeholder
        };

        // Add craft tags if provided
        if (craft_tags && Array.isArray(craft_tags)) {
            videoData.tags = craft_tags.map(tagName => ({
                tag: tagName,
                is_ai_generated: false,
            }));
        }

        const video = await Post.create(videoData);

        // Update artisan profile published videos count
        await ArtisanProfile.findOneAndUpdate(
            { user_id: req.user._id },
            { $inc: { published_videos_count: 1 } }
        );

        res.status(201).json({
            success: true,
            message: 'Content created successfully.',
            data: { video },
        });
    } catch (error) {
        console.error('Create content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create content.',
            error: error.message,
        });
    }
};

// @desc    Upload content (video/image)
// @route   POST /api/v1/content/upload
// @access  Private (artisan only)
export const uploadContent = async (req, res) => {
    try {
        const { title, description, overlays, tag_ids } = req.body;

        // Validate required fields
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please select a video or image file.',
            });
        }

        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Title is required.',
            });
        }

        // Determine content type from mimetype
        const isVideo = req.file.mimetype.startsWith('video');
        const content_type = isVideo ? 'video' : 'image';

        // Get media URL - use CDN if available for better performance
        let mediaUrl = req.file.location;
        if (process.env.DO_SPACES_CDN_ENDPOINT && mediaUrl.includes('digitaloceanspaces.com')) {
            // Replace Spaces URL with CDN URL
            const cdnBase = process.env.DO_SPACES_CDN_ENDPOINT;
            const bucket = process.env.DO_SPACES_BUCKET;
            const region = process.env.DO_SPACES_REGION || 'sgp1';
            mediaUrl = mediaUrl.replace(
                `https://${bucket}.${region}.digitaloceanspaces.com`,
                cdnBase
            );
        }

        // Create video record
        const videoData = {
            artisan: req.user._id,
            title: title.trim(), // Required field
            media_url: mediaUrl, // Use CDN URL if available
            content_type: content_type, // Required field
            url_high_res: mediaUrl, // S3 URL from multer-s3 (Legacy/Backup)
            description: description ? description.trim() : '',
        };

        // Parse and validate overlays
        if (overlays) {
            try {
                videoData.overlays = typeof overlays === 'string' ? JSON.parse(overlays) : overlays;
            } catch (parseError) {
                console.warn('Invalid overlays JSON:', parseError.message);
                // Continue without overlays if parsing fails
            }
        }

        // Parse and validate tags if provided
        if (tag_ids) {
            try {
                const tags = typeof tag_ids === 'string' ? JSON.parse(tag_ids) : tag_ids;
                videoData.craft_tags = Array.isArray(tags) ? tags : [tags];
            } catch (parseError) {
                console.warn('Invalid tags JSON:', parseError.message);
                // Continue without tags if parsing fails
            }
        }

        const video = await Post.create(videoData);

        console.log(`✅ Content uploaded successfully:`, {
            videoId: video._id,
            artisanId: req.user._id,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            contentType: content_type,
        });

        res.status(201).json({
            success: true,
            message: 'Content uploaded successfully.',
            data: {
                video: {
                    id: video._id,
                    title: video.title,
                    media_url: video.media_url,
                    content_type: video.content_type,
                    createdAt: video.createdAt,
                },
            },
        });
    } catch (error) {
        console.error('Upload content error:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?._id,
        });

        // Handle specific database errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid content data. Please check your input.',
                errors: Object.keys(error.errors),
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload content. Please try again.',
            code: 'UPLOAD_FAILED',
        });
    }
};

// @desc    Edit content metadata
// @route   PUT /api/content/:id
// @access  Private (artisan only)
export const editContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, craft_tags, overlays, tag_ids } = req.body;

        const video = await Post.findById(id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Content not found.',
            });
        }

        // Verify ownership
        if (video.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to edit this content.',
            });
        }

        // Update fields
        if (title !== undefined && title.trim()) video.title = title.trim();
        if (description !== undefined) video.description = description;
        if (craft_tags !== undefined && Array.isArray(craft_tags)) video.craft_tags = craft_tags;
        if (overlays !== undefined) video.overlays = overlays;
        if (tag_ids !== undefined) {
            video.tags = tag_ids.map(tagId => ({
                tag: tagId,
                is_ai_generated: false,
            }));
        }
        await video.save();

        res.status(200).json({
            success: true,
            message: 'Content updated successfully.',
            data: { video },
        });
    } catch (error) {
        console.error('Edit content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to edit content.',
            error: error.message,
        });
    }
};

// @desc    Delete content
// @route   DELETE /api/content/:videoId
// @access  Private (artisan only)
export const deleteContent = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Post.findById(id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Content not found.',
            });
        }

        // Verify ownership
        if (video.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this content.',
            });
        }

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

        // Delete from database
        await Post.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Content deleted successfully.',
        });
    } catch (error) {
        console.error('Delete content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete content.',
            error: error.message,
        });
    }
};

// @desc    Get content by ID
// @route   GET /api/content/:id
// @access  Public
export const getContent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid content ID.',
            });
        }

        const video = await Post.findById(id)
            .populate('artisan', 'name')
            .populate('tags.tag', 'name_english name_vernacular');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Content not found.',
            });
        }

        // Increment view count on video
        video.view_count += 1;
        await video.save();

        // Increment total views on artisan profile
        const artisanProfile = await ArtisanProfile.findOneAndUpdate(
            { user: video.artisan._id },
            { $inc: { total_views: 1 } },
            { returnDocument: 'after' }
        );

        // Track in daily analytics (fire-and-forget)
        trackPostView(video._id, video.artisan._id).catch(err =>
            console.error('[Analytics] trackPostView error:', err)
        );

        res.status(200).json({
            success: true,
            data: { video },
        });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch content.',
            error: error.message,
        });
    }
};

// @desc    Get artisan's content
// @route   GET /api/content/artisan/:artisanId
// @access  Public
export const getArtisanContent = async (req, res) => {
    try {
        const { artisanId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

            const posts = await Post.find({ artisan: artisanId })
            .populate('tags.tag', 'name_english name_vernacular')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Post.countDocuments({ artisan: artisanId });

        res.status(200).json({
            success: true,
            data: {
                    posts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get artisan content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch artisan content.',
            error: error.message,
        });
    }
};

// @desc    Publish content (make it live)
// @route   PUT /api/content/:id/publish
// @access  Private (artisan only)
export const publishContent = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Post.findById(id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Content not found.',
            });
        }

        // Verify ownership
        if (video.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to publish this content.',
            });
        }

        // Mark as published (you can add a status field to Video model if needed)
        // For now, we'll just return success

        res.status(200).json({
            success: true,
            message: 'Content published successfully.',
            data: { video },
        });
    } catch (error) {
        console.error('Publish content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to publish content.',
            error: error.message,
        });
    }
};

// @desc    Get content feed
// @route   GET /api/content/feed
// @access  Public
export const getContentFeed = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

            const posts = await Post.find()
            .populate({
                path: 'artisan',
                select: 'name profile_image_url location_city craft_specialization',
            })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { posts },
        });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feed.',
            error: error.message,
        });
    }
};

// @desc    Like content
// @route   POST /api/content/:id/like
// @access  Private
export const likeContent = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Post.findById(id).populate('artisan', 'name');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Content not found.',
            });
        }

        // Increment likes count on video
        video.likes_count += 1;
        await video.save();

        // Increment total likes on artisan profile
        const artisanProfile = await ArtisanProfile.findOneAndUpdate(
            { user: video.artisan._id },
            { $inc: { total_likes: 1 } },
            { returnDocument: 'after' }
        );

        // Track in daily analytics
        trackPostLike(video._id, video.artisan._id, true).catch(err =>
            console.error('[Analytics] trackPostLike error:', err)
        );

        // Create notification for the video creator (if not liking own video)
        if (video.artisan._id.toString() !== req.user._id.toString()) {
            const io = req.app.get('io');
            await createNotification({
                user: video.artisan._id,
                category: 'like',
                title: 'New Like',
                message: `${req.user.name} liked your video`,
                actor: req.user._id,
                related_entity: {
                    entity_type: 'video',
                    entity_id: video._id,
                },
            }, io);
        }

        res.status(200).json({
            success: true,
            data: { likes_count: video.likes_count },
        });
    } catch (error) {
        console.error('Like content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like content.',
            error: error.message,
        });
    }
};

// @desc    Unlike content
// @route   POST /api/content/:id/unlike
// @access  Private
export const unlikeContent = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Post.findById(id).populate('artisan', 'name');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Content not found.',
            });
        }

        // Decrement likes count only if it is above zero, and keep profile in sync
        if (video.likes_count > 0) {
            video.likes_count -= 1;
            await video.save();

            // Decrement total likes on artisan profile (only when post was actually decremented)
            await ArtisanProfile.findOneAndUpdate(
                { user: video.artisan._id },
                { $inc: { total_likes: -1 } },
                { returnDocument: 'after' }
            );

            // Track unlike in daily analytics
            trackPostLike(video._id, video.artisan._id, false).catch(err =>
                console.error('[Analytics] trackPostLike error:', err)
            );
        }

        res.status(200).json({
            success: true,
            data: { likes_count: video.likes_count },
        });
    } catch (error) {
        console.error('Unlike content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unlike content.',
            error: error.message,
        });
    }
};

// @desc    Share content
// @route   POST /api/content/:id/share
// @access  Private
export const shareContent = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Post.findById(id).populate('artisan', 'name');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Content not found.',
            });
        }

        // Increment shares count
        video.shares_count += 1;
        await video.save();

        // Increment total shares on artisan profile
        await ArtisanProfile.findOneAndUpdate(
            { user: video.artisan._id },
            { $inc: { total_shares: 1 } },
            { returnDocument: 'after' }
        );

        // Track share in daily analytics
        trackPostShare(video._id, video.artisan._id).catch(err =>
            console.error('[Analytics] trackPostShare error:', err)
        );

        res.status(200).json({
            success: true,
            data: { shares_count: video.shares_count },
        });
    } catch (error) {
        console.error('Share content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to share content.',
            error: error.message,
        });
    }
};

// @desc    Get current user's content
// @route   GET /api/content/my
// @access  Private (artisan only)
export const getMyContent = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ artisan: req.user._id })
            .select('_id title description media_url video_url_original thumbnail_url view_count likes_count comments_count tags craft_tags createdAt updatedAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCount = await Post.countDocuments({ artisan: req.user._id });
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            data: {
                posts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                },
            },
        });
    } catch (error) {
        console.error('Get my content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your posts.',
            error: error.message,
        });
    }
};

// Export all functions
export const getContentById = getContent;
export const getAllContent = getContentFeed;
export const getContentByArtisan = getArtisanContent;
export const updateContent = editContent;
