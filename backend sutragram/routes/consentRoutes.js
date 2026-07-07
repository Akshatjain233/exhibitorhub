import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    logConsent,
    getConsentHistory,
    revokeConsent,
    requestAccountDeletion,
} from '../controllers/consentController.js';

const router = express.Router();

// Consent logging
router.post('/', protect, logConsent);
router.get('/history', protect, getConsentHistory);
router.post('/revoke', protect, revokeConsent);

// GDPR Right to be Forgotten
router.post('/delete-account', protect, requestAccountDeletion);

export default router;
