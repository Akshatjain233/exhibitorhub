import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
    getDashboardStats,
    getAllUsers as adminGetAllUsers,
    getActiveUsers,
    getInactiveUsers,
    toggleUserActive,
    checkSystemHealth,
    getVerificationQueue,
    getPlatformAnalytics,
    getAllPosts,
    verifyPost,
    getAllProducts,
    verifyProduct,
    deleteProduct,
} from '../controllers/adminController.js';
import {
    getPendingVerifications,
    getVerificationDetails,
    approveVerification,
    rejectVerification,
} from '../controllers/verificationController.js';
import {
    getFlaggedContent,
    removeContent,
    approveContent,
} from '../controllers/moderationController.js';
import {
    getVideoAnalytics,
    getArtisanAnalytics,
    getProductPerformance,
    getTraderAnalytics,
    getTraderSupplyAnalytics,
} from '../controllers/analyticsController.js';
import {
    getPlatformFees,
    getRevenueReport,
    getGrowthFundAllocation,
    getRecentTransactions,
    getRevenueSources,
} from '../controllers/revenueController.js';
import {
    createCampaign,
    updateCampaign,
    serveAd,
    trackClick,
    getCampaignPerformance,
    getAllCampaigns,
} from '../controllers/advertisementController.js';

const router = express.Router();

// Admin dashboard & user management
router.get('/dashboard/stats', protect, restrictTo('admin'), getDashboardStats);
router.get('/analytics', protect, restrictTo('admin'), getPlatformAnalytics);
router.get('/users', protect, restrictTo('admin'), adminGetAllUsers);
router.get('/users/active', protect, restrictTo('admin'), getActiveUsers);
router.get('/users/inactive', protect, restrictTo('admin'), getInactiveUsers);
router.put('/users/:userId/toggle-active', protect, restrictTo('admin'), toggleUserActive);
router.get('/system/health', protect, restrictTo('admin'), checkSystemHealth);

// Verification management
router.get('/verifications/pending', protect, restrictTo('admin'), getPendingVerifications);
router.get('/verification-queue', protect, restrictTo('admin'), getVerificationQueue);
router.get('/verifications/:id', protect, restrictTo('admin'), getVerificationDetails);

// Verification adapter route - maps /admin/verify/:id to /verifications/:id/approve|reject
router.post('/verify/:id', protect, restrictTo('admin'), async (req, res, next) => {
    const { status } = req.body;
    if (status === 'approved') {
        return approveVerification(req, res);
    } else if (status === 'rejected') {
        return rejectVerification(req, res);
    } else {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Use "approved" or "rejected".',
        });
    }
});

router.post('/verifications/:id/approve', protect, restrictTo('admin'), approveVerification);
router.post('/verifications/:id/reject', protect, restrictTo('admin'), rejectVerification);

// Content moderation
router.get('/moderation/flagged', protect, restrictTo('admin'), getFlaggedContent);
router.delete('/moderation/content/:id', protect, restrictTo('admin'), removeContent);
router.post('/moderation/content/:id/approve', protect, restrictTo('admin'), approveContent);

// Analytics
router.get('/analytics/video/:videoId', protect, getVideoAnalytics);
router.get('/analytics/artisan/:artisanId', protect, getArtisanAnalytics);
router.get('/analytics/product/:productId', protect, getProductPerformance);
router.get('/analytics/trader/:traderId', protect, restrictTo('trader', 'admin'), getTraderAnalytics);
router.get('/analytics/trader-supply/:traderId', protect, restrictTo('trader', 'admin'), getTraderSupplyAnalytics);

// Revenue tracking
router.get('/revenue/platform-fees', protect, restrictTo('admin'), getPlatformFees);
router.get('/revenue/report', protect, restrictTo('admin'), getRevenueReport);
router.get('/revenue/growth-fund', protect, restrictTo('admin'), getGrowthFundAllocation);
router.get('/revenue/transactions', protect, restrictTo('admin'), getRecentTransactions);
router.get('/revenue/sources', protect, restrictTo('admin'), getRevenueSources);

// Advertisement management
router.post('/advertisements', protect, restrictTo('admin'), createCampaign);
router.get('/advertisements', protect, restrictTo('admin'), getAllCampaigns);
router.put('/advertisements/:id', protect, restrictTo('admin'), updateCampaign);
router.get('/advertisements/serve', serveAd);
router.post('/advertisements/:id/click', trackClick);
router.get('/advertisements/:id/performance', protect, restrictTo('admin'), getCampaignPerformance);

// Post management
router.get('/posts', protect, restrictTo('admin'), getAllPosts);
router.post('/posts/:id/verify', protect, restrictTo('admin'), verifyPost);

// Product management
router.get('/products', protect, restrictTo('admin'), getAllProducts);
router.post('/products/:id/verify', protect, restrictTo('admin'), verifyProduct);
router.delete('/products/:id', protect, restrictTo('admin'), deleteProduct);

export default router;
