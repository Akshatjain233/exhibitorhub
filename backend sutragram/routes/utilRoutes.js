import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
    search,
    searchCrafts,
    searchArtisansByLocation,
} from '../controllers/searchController.js';
import {
    createCraft,
    getCraftById,
    updateCraft,
    deleteCraft,
    getAllCrafts,
} from '../controllers/craftController.js';
import {
    checkUploadStatus,
    notifyUploadComplete,
} from '../controllers/uploadController.js';
import {
    getUploadProgress,
    processUploadedVideo,
} from '../controllers/mediaController.js';
import {
    getTranslations,
    getSupportedLanguages,
} from '../controllers/localizationController.js';
import {
    healthCheck,
    readinessCheck,
    livenessCheck,
} from '../controllers/healthController.js';

const router = express.Router();

// Search routes
router.get('/search', search);
router.get('/search/crafts', searchCrafts);
router.get('/search/artisans/location', searchArtisansByLocation);

// Craft management
router.post('/crafts', protect, restrictTo('admin'), createCraft);
router.get('/crafts/:id', getCraftById);
router.put('/crafts/:id', protect, restrictTo('admin'), updateCraft);
router.delete('/crafts/:id', protect, restrictTo('admin'), deleteCraft);
router.get('/crafts', getAllCrafts);

// Upload management
router.get('/upload/:videoId/status', protect, checkUploadStatus);
router.post('/upload/:videoId/complete', protect, notifyUploadComplete);

// Media management
router.get('/media/upload-progress/:uploadId', protect, getUploadProgress);
router.post('/media/process-upload', protect, processUploadedVideo);

// Localization
router.get('/localization/translations', getTranslations);
router.get('/localization/languages', getSupportedLanguages);

// Health checks
router.get('/health', healthCheck);
router.get('/health/readiness', readinessCheck);
router.get('/health/liveness', livenessCheck);

export default router;
