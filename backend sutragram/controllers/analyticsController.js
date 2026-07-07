import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Order from '../models/Order.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import ArtisanAnalytics from '../models/ArtisanAnalytics.js';
import QuoteRequest from '../models/QuoteRequest.js';
import B2BOrder from '../models/B2BOrder.js';
import LeadAccess from '../models/LeadAccess.js';
import RawMaterial from '../models/RawMaterial.js';

// @desc    Get video analytics
// @route   GET /api/analytics/video/:videoId
// @access  Private (artisan/admin only)
export const getVideoAnalytics = async (req, res) => {
    try {
        const { videoId } = req.params;

        // Guard against invalid ObjectId (would throw CastError in mongoose)
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid video ID.',
            });
        }

        const video = await Post.findById(videoId)
            .populate('artisan', 'name');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found.',
            });
        }

        // Guard: artisan may be null if user was deleted
        if (!video.artisan) {
            return res.status(500).json({
                success: false,
                message: 'Video owner not found.',
            });
        }

        // Verify ownership (artisan or admin)
        const isOwner = video.artisan._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view analytics for this video.',
            });
        }
        // REAL analytics from the video document
        const analytics = {
            views: video.view_count || 0,
            likes: video.likes_count || 0,
            shares: video.shares_count || 0,
            comments: video.comments_count || 0,
            engagement_rate: video.view_count > 0
                ? (((video.likes_count || 0) + (video.shares_count || 0) + (video.comments_count || 0)) / video.view_count * 100).toFixed(2)
                : '0.00',
            created_at: video.createdAt,
            days_since_post: Math.floor((Date.now() - video.createdAt) / (1000 * 60 * 60 * 24)),
        };

        res.status(200).json({
            success: true,
            data: { analytics },
        });
    } catch (error) {
        console.error('Get video analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video analytics.',
            error: error.message,
        });
    }
};

// @desc    Get artisan analytics
// @route   GET /api/analytics/artisan
// @access  Private (artisan only)
export const getArtisanAnalytics = async (req, res) => {
    try {
        const artisanId = req.params.artisanId || req.user._id;

        // Guard against invalid ObjectId from route param
        if (req.params.artisanId && !mongoose.Types.ObjectId.isValid(req.params.artisanId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid artisan ID.',
            });
        }

        const profile = await ArtisanProfile.findOne({ user: artisanId });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found.',
            });
        }

        // Real order statistics
        const orders = await Order.find({ artisan: artisanId });
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => 
            o.order_status === 'delivered' && 
            (o.payment_status === 'completed' || o.payment_status === 'paid')
        ).length;
        const totalRevenue = orders
            .filter(o => o.order_status === 'delivered' && 
                (o.payment_status === 'completed' || o.payment_status === 'paid'))
            .reduce((sum, order) => sum + (order.total_amount || 0), 0);

        // Real weekly trends from ArtisanAnalytics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const analyticsData = await ArtisanAnalytics.find({
            artisan: artisanId,
            date: { $gte: twoWeeksAgo, $lte: today }
        }).sort({ date: 1 });

        const weeklyViews = [];
        const weeklyLikes = [];
        const weeklyOrders = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dayData = analyticsData.find(d => {
                const dDate = new Date(d.date);
                dDate.setHours(0, 0, 0, 0);
                return dDate.getTime() === date.getTime();
            });

            weeklyViews.push(dayData?.daily_views || 0);
            weeklyLikes.push(dayData?.daily_likes || 0);
            weeklyOrders.push(dayData?.daily_orders || 0);
        }

        // Video stats
        const posts = await Post.find({ artisan: artisanId });
        const totalViews = posts.reduce((sum, post) => sum + (post.view_count || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalViews,
                    totalLikes: profile.total_likes || 0,
                    totalShares: profile.total_shares || 0,
                    rating: profile.rating_avg || 0,
                    ratingCount: profile.rating_count || 0,
                },
                orders: {
                    total: totalOrders,
                    completed: completedOrders,
                    revenue: totalRevenue,
                },
                trends: {
                    weekly: {
                        views: weeklyViews,
                        likes: weeklyLikes,
                        orders: weeklyOrders,
                    },
                },
            },
        });
    } catch (error) {
        console.error('Get artisan analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch artisan analytics.',
            error: error.message,
        });
    }
};

// @desc    Get product performance
// @route   GET /api/analytics/product/:productId
// @access  Private (artisan only)
export const getProductPerformance = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID.',
            });
        }

        // Get orders containing this product
        const orders = await Order.find({
            'items.product': productId,
            artisan: req.user._id,
        });

        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.order_status === 'delivered').length;

        // Calculate total quantity sold
        let totalQuantity = 0;
        let totalRevenue = 0;

        orders.forEach(order => {
            // product field is Mixed type — guard against null before calling toString()
            const item = order.items.find(i => i.product && i.product.toString() === productId);
            if (item) {
                totalQuantity += item.quantity;
                if (order.order_status === 'delivered') {
                    totalRevenue += (item.price_at_purchase || 0) * item.quantity;
                }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                completedOrders,
                totalQuantity,
                totalRevenue,
            },
        });
    } catch (error) {
        console.error('Get product performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product performance.',
            error: error.message,
        });
    }
};

// @desc    Get trader analytics
// @route   GET /api/analytics/trader
// @access  Private (trader only)
export const getTraderAnalytics = async (req, res) => {
    try {
        const traderId = req.params.traderId || req.user._id;

        // Guard against invalid ObjectId in route param
        if (req.params.traderId && !mongoose.Types.ObjectId.isValid(req.params.traderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trader ID.',
            });
        }

        // Real trader analytics from actual data
        // B2BOrder uses 'trader' field (not 'buyer'), 'total_price' (not 'total_amount')
        // QuoteRequest uses 'requester' field for the person who sent the quote
        const [
            quotesRequested,
            ordersPlaced,
            completedOrders,
        ] = await Promise.all([
            QuoteRequest.countDocuments({ requester: traderId }),
            B2BOrder.countDocuments({ trader: traderId }),
            B2BOrder.countDocuments({ trader: traderId, status: 'delivered' }),
        ]);

        // Real spending from completed orders (field is 'total_price' on B2BOrder)
        const spendingAgg = await B2BOrder.aggregate([
            { $match: { trader: new mongoose.Types.ObjectId(traderId.toString()), status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$total_price' } } },
        ]);

        const analytics = {
            quotesRequested,
            ordersPlaced,
            completedOrders,
            totalSpent: spendingAgg[0]?.total || 0,
        };

        res.status(200).json({
            success: true,
            data: { analytics },
        });
    } catch (error) {
        console.error('Get trader analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trader analytics.',
            error: error.message,
        });
    }
};

// @desc    Get trader supply analytics
// @route   GET /api/analytics/trader-supply
// @access  Private (trader only)
export const getTraderSupplyAnalytics = async (req, res) => {
    try {
        const traderId = req.params.traderId || req.user._id;

        // Guard against invalid ObjectId in route param
        if (req.params.traderId && !mongoose.Types.ObjectId.isValid(req.params.traderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid trader ID.',
            });
        }

        // LeadAccess: 'trader' = who accessed the lead, 'artisan' = the lead being accessed
        // RawMaterial: 'seller' = the trader/user who listed it (not 'supplier')
        // QuoteRequest: 'recipient' = who received the quote request
        const [
            leadsGenerated,
            leadsContacted,
            materialsListed,
            inquiriesReceived,
        ] = await Promise.all([
            LeadAccess.countDocuments({ trader: traderId }),
            LeadAccess.countDocuments({ trader: traderId, interaction_type: { $in: ['quote_sent', 'contact_requested'] } }),
            RawMaterial.countDocuments({ seller: traderId }),
            QuoteRequest.countDocuments({ recipient: traderId }),
        ]);

        const analytics = {
            leadsGenerated,
            leadsContacted,
            materialsListed,
            inquiriesReceived,
        };

        res.status(200).json({
            success: true,
            data: { analytics },
        });
    } catch (error) {
        console.error('Get trader supply analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trader supply analytics.',
            error: error.message,
        });
    }
};
