import ArtisanProfile from '../models/ArtisanProfile.js';
import ArtisanAnalytics from '../models/ArtisanAnalytics.js';

/**
 * Updates analytics when a post is viewed
 */
export const trackPostView = async (postId, artisanId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // NOTE: ArtisanProfile.total_views is already updated atomically by
        // contentController (getContent). Only update the daily time-series here.
        await ArtisanAnalytics.updateOne(
            { artisan: artisanId, date: today },
            { $inc: { daily_views: 1 } },
            { upsert: true }
        );

        console.log(`[Analytics] View tracked for artisan ${artisanId}`);
    } catch (error) {
        console.error('[Analytics] Error tracking view:', error);
    }
};

/**
 * Updates analytics when a post is liked
 */
export const trackPostLike = async (postId, artisanId, isLike = true) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const increment = isLike ? 1 : -1;

        // NOTE: ArtisanProfile.total_likes is already updated atomically by
        // contentController (likeContent / unlikeContent). Only update the
        // daily ArtisanAnalytics time-series record here to avoid double-counting.
        await ArtisanAnalytics.updateOne(
            { artisan: artisanId, date: today },
            { $inc: { daily_likes: increment } },
            { upsert: true }
        );

        console.log(`[Analytics] Like tracked for artisan ${artisanId}`);
    } catch (error) {
        console.error('[Analytics] Error tracking like:', error);
    }
};

/**
 * Updates analytics when a post is shared
 */
export const trackPostShare = async (postId, artisanId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // NOTE: ArtisanProfile.total_shares is already updated atomically by
        // contentController (shareContent). Only update the daily time-series here.
        await ArtisanAnalytics.updateOne(
            { artisan: artisanId, date: today },
            { $inc: { daily_shares: 1 } },
            { upsert: true }
        );

        console.log(`[Analytics] Share tracked for artisan ${artisanId}`);
    } catch (error) {
        console.error('[Analytics] Error tracking share:', error);
    }
};

/**
 * Updates analytics when an order is created
 */
export const trackOrderCreation = async (orderId, artisanId, orderAmount = 0) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Update daily analytics
        await ArtisanAnalytics.updateOne(
            { artisan: artisanId, date: today },
            { $inc: { daily_orders: 1, daily_revenue: orderAmount } },
            { upsert: true }
        );

        console.log(`[Analytics] Order tracked for artisan ${artisanId}: ₹${orderAmount}`);
    } catch (error) {
        console.error('[Analytics] Error tracking order:', error);
    }
};

/**
 * Updates analytics when an order is completed
 */
export const trackOrderCompletion = async (orderId, artisanId, orderAmount = 0) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Update daily analytics
        await ArtisanAnalytics.updateOne(
            { artisan: artisanId, date: today },
            { $inc: { daily_completed_orders: 1 } },
            { upsert: true }
        );

        console.log(`[Analytics] Order completion tracked for artisan ${artisanId}`);
    } catch (error) {
        console.error('[Analytics] Error tracking order completion:', error);
    }
};

/**
 * Recalculates and updates cumulative analytics
 */
export const updateCumulativeAnalytics = async (artisanId) => {
    try {
        const { default: Order } = await import('../models/Order.js');
        const { default: Post } = await import('../models/Post.js');

        // Get all posts for this artisan
        const posts = await Post.find({ artisan: artisanId });
        const totalViews = posts.reduce((sum, post) => sum + (post.view_count || 0), 0);
        const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
        const totalShares = posts.reduce((sum, post) => sum + (post.shares_count || 0), 0);

        // Get all orders for this artisan
        const orders = await Order.find({ artisan: artisanId });
        const totalOrders = orders.length;
        const completedOrders = orders.filter(
            o => o.order_status === 'delivered'
        ).length;
        const totalRevenue = orders
            .filter(o => o.order_status === 'delivered')
            .reduce((sum, order) => sum + (order.total_amount || 0), 0);

        // Update profile
        const profile = await ArtisanProfile.findOneAndUpdate(
            { user: artisanId },
            {
                total_views: totalViews,
                total_likes: totalLikes,
                total_shares: totalShares,
            },
            { new: true }
        );

        console.log(`[Analytics] Cumulative analytics updated for artisan ${artisanId}`);
        return {
            totalViews,
            totalLikes,
            totalShares,
            totalOrders,
            completedOrders,
            totalRevenue,
        };
    } catch (error) {
        console.error('[Analytics] Error updating cumulative analytics:', error);
        throw error;
    }
};
