import express from 'express';
import fileUpload from 'express-fileupload';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
    getArtisanProfile,
    updateArtisanProfile,
    getPublicArtisanProfile,
    searchArtisans,
} from '../controllers/artisanController.js';
import {
    getConsumerProfile,
    updateConsumerProfile,
    updatePreferences,
    followArtisan,
    unfollowArtisan,
} from '../controllers/consumerController.js';
import {
    getProfile,
    updateProfile,
    deleteAccount,
    changePassword,
    uploadProfilePicture,
} from '../controllers/userController.js';

const router = express.Router();

// Configure express-fileupload middleware (applied locally, not globally)
const fileUploadMiddleware = fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for profile pictures
});

// User profile routes (all roles)
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.delete('/me', protect, deleteAccount);
router.put('/change-password', protect, changePassword);
// Apply fileUpload middleware only to this route
router.post('/upload-profile-picture', protect, fileUploadMiddleware, uploadProfilePicture);

// Artisan-specific routes
router.get('/artisan/:id', getPublicArtisanProfile);
router.put('/artisan/:id', protect, restrictTo('artisan'), updateArtisanProfile);
router.get('/artisans', searchArtisans);
router.post('/artisan/:id/follow', protect, restrictTo('consumer'), followArtisan);
router.post('/artisan/:id/unfollow', protect, restrictTo('consumer'), unfollowArtisan);

// Consumer-specific routes (static paths BEFORE parameterized /:id)
router.put('/consumer/preferences', protect, restrictTo('consumer'), updatePreferences);
router.get('/consumer/:id', protect, getConsumerProfile);
router.put('/consumer/:id', protect, restrictTo('consumer'), updateConsumerProfile);

export default router;
