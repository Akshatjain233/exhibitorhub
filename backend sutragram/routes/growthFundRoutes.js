import express from 'express';
import {
    applyForGrowthFund,
    getMyApplications,
    getApplicationById,
    getAllApplications,
    updateApplicationStatus,
    markAsDisbursed,
    getGrowthFundStatistics,
} from '../controllers/growthFundController.js';
import { authenticate, authorize } from '../middlewares/userAuth.js';

const router = express.Router();

// Artisan routes
router.post('/apply', authenticate, authorize('artisan'), applyForGrowthFund);
router.get('/my-applications', authenticate, authorize('artisan'), getMyApplications);

// Shared routes (artisan/admin)
router.get('/applications/:id', authenticate, getApplicationById);

// Admin routes
router.get('/applications', authenticate, authorize('admin'), getAllApplications);
router.put('/applications/:id/status', authenticate, authorize('admin'), updateApplicationStatus);
router.put('/applications/:id/disburse', authenticate, authorize('admin'), markAsDisbursed);
router.get('/statistics', authenticate, authorize('admin'), getGrowthFundStatistics);

export default router;
