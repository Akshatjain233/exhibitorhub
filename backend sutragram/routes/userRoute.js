import express from 'express';
import {
    getProfile,
    updateProfile,
    changePassword,
    updateSettings,
    deactivateAccount,
    requestDataDeletion,
    deleteAccount,
    getPublicProfile
} from '../controllers/userController.js';
import { authenticate } from '../middlewares/userAuth.js';

const router = express.Router();

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.put('/settings', authenticate, updateSettings);
router.put('/deactivate', authenticate, deactivateAccount);
router.post('/request-deletion', authenticate, requestDataDeletion);
router.delete('/account', authenticate, deleteAccount);

// Public routes
router.get('/:userId/public-profile', getPublicProfile);

export default router;
