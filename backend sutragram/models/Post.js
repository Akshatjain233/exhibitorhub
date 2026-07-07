import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Content type (video, image, reel)
    content_type: {
        type: String,
        enum: ['video', 'image', 'reel', 'short', 'carousel'],
        required: true,
    },
    // Video URLs
    media_url: {
        type: String,
        required: true,
    },
    video_url_original: {
        type: String,
    },
    video_url_1080p: {
        type: String,
    },
    video_url_720p: {
        type: String,
    },
    video_url_480p: {
        type: String,
    },
    url_high_res: { // Legacy field
        type: String,
    },
    url_low_bw: { // Legacy field
        type: String,
    },
    thumbnail_url: {
        type: String,
    },
    // Metadata
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    duration: {
        type: Number, // Duration in seconds
        default: 0,
    },
    duration_sec: { // Legacy field
        type: Number,
    },
    overlays: {
        type: Object, // JSON for stickers, text overlays
    },
    // Engagement metrics
    view_count: {
        type: Number,
        default: 0,
    },
    views_count: {
        type: Number,
        default: 0,
    },
    likes_count: {
        type: Number,
        default: 0,
    },
    comments_count: {
        type: Number,
        default: 0,
    },
    shares_count: {
        type: Number,
        default: 0,
    },
    is_live: {
        type: Boolean,
        default: true,
    },
    // Location
    location: {
        type: String,
    },
    // Craft tags
    craft_tags: [{
        type: String,
    }],
    product_links: [{
        type: String,
    }],
    // Verification (admin-verified posts)
    is_verified: {
        type: Boolean,
        default: false,
    },
    verified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    verified_at: {
        type: Date,
    },
    // Tags
    tags: [{
        tag: {
            type: String, // Can be tag name directly
        },
        is_ai_generated: {
            type: Boolean,
            default: false,
        },
        confidence_score: {
            type: Number,
        }
    }],
}, { timestamps: true });

// Indexes for performance
postSchema.index({ artisan: 1, createdAt: -1 });
postSchema.index({ view_count: -1 });
postSchema.index({ likes_count: -1 });
postSchema.index({ craft_tags: 1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
