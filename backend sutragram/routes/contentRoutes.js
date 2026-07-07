import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { upload } from '../config/s3.js';
import {
    createContent,
    uploadContent,
    getContentById,
    updateContent,
    deleteContent,
    publishContent,
    getAllContent,
    likeContent,
    unlikeContent,
    shareContent,
    getContentByArtisan,
    getMyContent,
} from '../controllers/contentController.js';
import {
    getPersonalizedFeed,
    getTrendingFeed,
    getUnifiedFeed,
} from '../controllers/feedController.js';
import {
    getRecommendations,
} from '../controllers/recommendationController.js';
import {
    autoTagContent,
    suggestTags,
    addManualTags,
    removeTag,
} from '../controllers/taggingController.js';
import {
    getComments,
    createComment,
} from '../controllers/commentController.js';
import {
    search,
} from '../controllers/searchController.js';

const router = express.Router();

// Enhanced multer error handler
// Handles "Unexpected end of form", file size, missing file, and other multer errors
const handleUpload = (req, res, next) => {
    upload.single('video')(req, res, (err) => {
        // Handle multer errors
        if (err) {
            console.error('Upload error:', err.name, '-', err.message);

            // Specific error handling for common cases
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({
                    success: false,
                    message: 'File size exceeds 100MB limit. Please upload a smaller file.',
                });
            }

            if (err.code === 'LIMIT_PART_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Too many form fields. Please try again.',
                });
            }

            if (err.message === 'Only video and image files are allowed') {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }

            // "Unexpected end of form" - multipart parsing error
            if (err.message.includes('Unexpected end of form') || err.message.includes('Unexpected token')) {
                console.error('Multipart form parsing failed:', err.message);
                return res.status(400).json({
                    success: false,
                    message: 'File upload incomplete or corrupted. Please check your file and try again.',
                    code: 'MALFORMED_UPLOAD',
                });
            }

            // S3/DigitalOcean Spaces errors
            if (err.name === 'NoSuchBucket' || err.Code === 'NoSuchBucket') {
                console.error('S3 bucket error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Storage service error. Please try again later.',
                    code: 'STORAGE_ERROR',
                });
            }

            if (err.name === 'InvalidAccessKeyId' || err.Code === 'InvalidAccessKeyId') {
                console.error('S3 credentials error');
                return res.status(500).json({
                    success: false,
                    message: 'Storage service authentication failed. Please try again later.',
                    code: 'STORAGE_AUTH_ERROR',
                });
            }

            // Generic fallback error
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload failed. Please try again.',
                code: 'UPLOAD_ERROR',
            });
        }

        // Check if file was actually uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file was uploaded. Please select a file.',
            });
        }

        next();
    });
};

// Content upload route - POST /api/v1/content
// This is the main route for uploading video/image files
router.post('/', protect, restrictTo('artisan'), handleUpload, uploadContent);

// Content creation route (metadata only, no file upload)
router.post('/create', protect, restrictTo('artisan'), createContent);

// Get current user's content (must come before /:id route)
router.get('/my', protect, restrictTo('artisan'), getMyContent);
router.get('/', getAllContent);
router.get('/artisan/:artisanId', getContentByArtisan);

// Feed routes
router.get('/feed/personalized', protect, getPersonalizedFeed);
router.get('/feed/trending', getTrendingFeed);
// Unified home feed — all roles, all content types, with type filter
// GET /api/v1/content/feed?type=all|posts|products|rawmaterials&page=N
router.get('/feed', getUnifiedFeed);

// Search routes
router.get('/search', search);

// Recommendations
router.get('/recommendations/content', protect, getRecommendations);

// Comments
router.get('/:videoId/comments', getComments);
router.post('/:videoId/comments', protect, createComment);

// Engagement
router.post('/:id/like', protect, likeContent);
router.post('/:id/unlike', protect, unlikeContent);
router.post('/:id/share', protect, shareContent);

// Dynamic content routes (keep after static paths like /feed and /search)
router.get('/:id', getContentById);
router.put('/:id', protect, restrictTo('artisan'), updateContent);
router.delete('/:id', protect, restrictTo('artisan'), deleteContent);
router.post('/:id/publish', protect, restrictTo('artisan'), publishContent);

// Tagging
router.post('/:id/tags/auto', protect, restrictTo('artisan'), autoTagContent);
router.get('/:id/tags/suggestions', protect, restrictTo('artisan'), suggestTags);
router.post('/:id/tags', protect, restrictTo('artisan'), addManualTags);
router.delete('/:id/tags', protect, restrictTo('artisan'), removeTag);

export default router;
