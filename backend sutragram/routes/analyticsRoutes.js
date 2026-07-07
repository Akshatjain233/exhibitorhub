import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
    getVideoAnalytics,
    getArtisanAnalytics,
    getProductPerformance,
} from '../controllers/analyticsController.js';
import {
    aggregateDailyAnalytics,
    aggregateWeeklyAnalytics,
    generateMonthlyReport,
    calculateEngagementMetrics,
} from '../jobs/analyticsJobs.js';

const router = express.Router();

// Public routes
router.get('/engagement', async (req, res) => {
    try {
        const metrics = await calculateEngagementMetrics();
        res.json({ success: true, data: metrics });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Artisan analytics
router.get('/artisan', protect, restrictTo('artisan'), getArtisanAnalytics);
router.get('/video/:videoId', protect, getVideoAnalytics);
router.get('/product/:productId', protect, restrictTo('artisan'), getProductPerformance);

// Admin-only analytics aggregation triggers
router.post(
    '/aggregate/daily',
    protect,
    restrictTo('admin'),
    async (req, res) => {
        try {
            await aggregateDailyAnalytics();
            res.json({ success: true, message: 'Daily analytics aggregated' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

router.post(
    '/aggregate/weekly',
    protect,
    restrictTo('admin'),
    async (req, res) => {
        try {
            const stats = await aggregateWeeklyAnalytics();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

router.post(
    '/report/monthly',
    protect,
    restrictTo('admin'),
    async (req, res) => {
        try {
            const report = await generateMonthlyReport();
            res.json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

export default router;
