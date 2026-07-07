import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import b2bRoutes from './b2bRoutes.js';
import commerceRoutes from './commerceRoutes.js';
import userRoutes from './userRoutes.js';
import artisanRoutes from './artisanRoute.js';
import contentRoutes from './contentRoutes.js';
import socialRoutes from './socialRoutes.js';
import utilRoutes from './utilRoutes.js';
import commentRoutes from './commentRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import growthFundRoutes from './growthFundRoutes.js';
import disputeRoutes from './disputeRoutes.js';
import searchRoutes from './searchRoutes.js';
import chatRoutes from './chatRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import testRoutes from './testRoutes.js';
import quoteRoutes from './quoteRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import consumerRoutes from './consumerRoute.js';
import consentRoutes from './consentRoutes.js';
import { getUnifiedFeed } from '../controllers/feedController.js';

const router = express.Router();

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/b2b', b2bRoutes);
router.use('/', commerceRoutes);  // Commerce routes include /workshops, /products, /orders
router.use('/users', userRoutes);
router.use('/artisans', artisanRoutes);  // Artisan-specific routes
router.use('/content', contentRoutes);
router.use('/social', socialRoutes);
router.use('/util', utilRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/growth-fund', growthFundRoutes);
router.use('/disputes', disputeRoutes);
router.use('/search', searchRoutes);
router.use('/chats', chatRoutes);
router.use('/media', mediaRoutes);
router.use('/test', testRoutes);  // Test/debug routes
router.use('/quotes', quoteRoutes);  // Quote request routes
router.use('/analytics', analyticsRoutes);  // Analytics routes
router.use('/consumer', consumerRoutes);  // Consumer profile/address/follow routes
router.use('/consent', consentRoutes);  // GDPR consent routes

// Convenience unified feed shortcut: GET /api/v1/feed
router.get('/feed', getUnifiedFeed);

// API health check
router.get('/status', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SutraGram API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        routes: {
            auth: 'active',
            users: 'active',
            artisans: 'active',
            content: 'active',
            commerce: 'active',
            social: 'active',
            b2b: 'active',
            admin: 'active',
            util: 'active',
            comments: 'active',
            notifications: 'active',
            disputes: 'active',
            chats: 'active',
            search: 'active',
            quotes: 'active',
            analytics: 'active',
        },
    });
});

export default router;
