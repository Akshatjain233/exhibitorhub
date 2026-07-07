import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
    createDispute,
    getMyDisputes,
    getAllDisputes,
    getDispute,
    resolveDispute,
    markDisputeUnderReview,
    rejectDisputeHandler,
    addConsumerResponseHandler,
    addSellerResponseHandler,
} from '../controllers/disputeController.js';

const router = express.Router();

// User routes
router.post('/', protect, createDispute);
router.get('/my-disputes', protect, getMyDisputes);

// Single dispute routes (must come before admin routes)
router.get('/:disputeId', protect, getDispute);
router.put('/:disputeId/consumer-response', protect, addConsumerResponseHandler);
router.put('/:disputeId/seller-response', protect, addSellerResponseHandler);

// Admin routes
router.get('/', protect, restrictTo('admin'), getAllDisputes);
router.put('/:disputeId/mark-under-review', protect, restrictTo('admin'), markDisputeUnderReview);
router.put('/:disputeId/resolve', protect, restrictTo('admin'), resolveDispute);
router.put('/:disputeId/reject', protect, restrictTo('admin'), rejectDisputeHandler);

export default router;
