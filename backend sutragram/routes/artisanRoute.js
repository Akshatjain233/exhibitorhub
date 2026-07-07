import express from 'express';
import {
    getArtisanProfile,
    updateArtisanProfile,
    updateBio,
    updateCraftTags,
    linkPaymentAccount,
    getVerificationStatus,
    submitForVerification,
    getAnalytics,
    triggerAnalyticsAggregation,
    getPublicArtisanProfile,
    searchArtisans
} from '../controllers/artisanController.js';
import { authenticate, authorize } from '../middlewares/userAuth.js';

const router = express.Router();

// Public routes
router.get('/search', searchArtisans);

// Protected routes (artisan only) - Must come BEFORE /:artisanId to avoid route collision
router.get('/profile', authenticate, authorize('artisan'), getArtisanProfile);
router.put('/profile', authenticate, authorize('artisan'), updateArtisanProfile);
router.put('/bio', authenticate, authorize('artisan'), updateBio);
router.put('/craft-tags', authenticate, authorize('artisan'), updateCraftTags);
router.put('/payment-account', authenticate, authorize('artisan'), linkPaymentAccount);
router.get('/verification-status', authenticate, authorize('artisan'), getVerificationStatus);
router.post('/submit-verification', authenticate, authorize('artisan'), submitForVerification);
router.get('/analytics', authenticate, authorize('artisan'), getAnalytics);
router.post('/analytics/aggregate', authenticate, authorize('artisan'), triggerAnalyticsAggregation);

// Public artisan profile - Must be LAST as it's a catch-all route
router.get('/:artisanId', getPublicArtisanProfile);

export default router;
