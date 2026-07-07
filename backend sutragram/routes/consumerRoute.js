import express from 'express';
import {
    getConsumerProfile,
    updateConsumerProfile,
    updatePreferences,
    updateInterests,
    followArtisan,
    unfollowArtisan,
    getFollowedArtisans,
    addAddress,
    updateAddress,
    deleteAddress,
    getAddresses
} from '../controllers/consumerController.js';
import { authenticate, authorize } from '../middlewares/userAuth.js';

const router = express.Router();

// All routes are protected and consumer-only
router.get('/profile', authenticate, authorize('consumer'), getConsumerProfile);
router.put('/profile', authenticate, authorize('consumer'), updateConsumerProfile);
router.put('/preferences', authenticate, authorize('consumer'), updatePreferences);
router.put('/interests', authenticate, authorize('consumer'), updateInterests);

// Follow functionality
router.post('/follow/:artisanId', authenticate, authorize('consumer'), followArtisan);
router.delete('/follow/:artisanId', authenticate, authorize('consumer'), unfollowArtisan);
router.get('/following', authenticate, authorize('consumer'), getFollowedArtisans);

// Address management
router.get('/addresses', authenticate, authorize('consumer'), getAddresses);
router.post('/address', authenticate, authorize('consumer'), addAddress);
router.put('/address/:addressId', authenticate, authorize('consumer'), updateAddress);
router.delete('/address/:addressId', authenticate, authorize('consumer'), deleteAddress);

export default router;
