import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../config/s3.js';

const router = express.Router();

// @desc    Upload a media file directly to storage (no Video document created)
// @route   POST /api/v1/media/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded.',
            });
        }

        const url = req.file.location; // multer-s3 sets this

        res.status(200).json({
            success: true,
            data: { url },
        });
    } catch (error) {
        console.error('Media upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload media.',
            error: error.message,
        });
    }
});

export default router;
