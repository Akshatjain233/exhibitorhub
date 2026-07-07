import Analytics from '../models/Analytics.js';
import ArtisanAnalytics from '../models/ArtisanAnalytics.js';
import Post from '../models/Post.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * Aggregate daily analytics
 * This function should be run as a daily cron job
 */
export const aggregateDailyAnalytics = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Platform-wide analytics
        const [
            totalUsers,
            newUsers,
            totalPosts,
            newPosts,
            totalProducts,
            newProducts,
            totalOrders,
            newOrders,
            totalRevenue,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            Post.countDocuments(),
            Post.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            Product.countDocuments(),
            Product.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            Transaction.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        // Create or update daily analytics
        await Analytics.findOneAndUpdate(
            { date: today },
            {
                date: today,
                platform_stats: {
                    total_users: totalUsers,
                    new_users: newUsers,
                    total_posts: totalPosts,
                    new_posts: newPosts,
                    total_products: totalProducts,
                    new_products: newProducts,
                    total_orders: totalOrders,
                    new_orders: newOrders,
                    total_revenue: totalRevenue[0]?.total || 0,
                },
            },
            { upsert: true, new: true }
        );

        // Aggregate artisan-specific analytics
        await aggregateArtisanAnalytics(today, tomorrow);

        console.log(`✅ Daily analytics aggregated for ${today.toDateString()}`);
    } catch (error) {
        console.error('❌ Error aggregating daily analytics:', error);
        throw error;
    }
};

/**
 * Aggregate artisan-specific analytics
 */
const aggregateArtisanAnalytics = async (startDate, endDate) => {
    try {
        // Get all artisans
        const artisans = await User.find({ role: 'artisan' }).select('_id');

        for (const artisan of artisans) {
            const [
                videoViewsAgg,
                ordersReceived,
                revenueAgg,
            ] = await Promise.all([
                // Video views — sum of view_count across all posts (cumulative snapshot)
                Post.aggregate([
                    { $match: { artisan: artisan._id } },
                    { $group: { _id: null, total: { $sum: '$view_count' } } },
                ]),
                // Orders received today
                Order.countDocuments({
                    artisan: artisan._id,
                    createdAt: { $gte: startDate, $lt: endDate },
                }),
                // Revenue from completed transactions today
                Transaction.aggregate([
                    {
                        $match: {
                            recipient: artisan._id,
                            status: 'completed',
                            createdAt: { $gte: startDate, $lt: endDate },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
            ]);

            // Use correct ArtisanAnalytics schema field names
            // daily_views here is overwritten from the aggregated cumulative total;
            // real-time increments from analyticsService remain intact for new events.
            await ArtisanAnalytics.findOneAndUpdate(
                { artisan: artisan._id, date: startDate },
                {
                    artisan: artisan._id,
                    date: startDate,
                    // $max ensures we never reduce daily_views below what events already recorded
                    $max: { daily_views: videoViewsAgg[0]?.total || 0 },
                    $inc: {},  // placeholder — orders and revenue are already tracked by analyticsService
                },
                { upsert: true, new: true }
            );

            // Only set daily_orders and daily_revenue if not already written by analyticsService
            // Use $setOnInsert to avoid overwriting real-time tracked values
            await ArtisanAnalytics.updateOne(
                { artisan: artisan._id, date: startDate, daily_orders: { $exists: false } },
                { $set: { daily_orders: ordersReceived, daily_revenue: revenueAgg[0]?.total || 0 } }
            );
        }

        console.log(`✅ Artisan analytics aggregated for ${artisans.length} artisans`);
    } catch (error) {
        console.error('❌ Error aggregating artisan analytics:', error);
        throw error;
    }
};

/**
 * Aggregate weekly analytics summary
 */
export const aggregateWeeklyAnalytics = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weeklyStats = await Analytics.aggregate([
            { $match: { date: { $gte: weekAgo, $lt: today } } },
            {
                $group: {
                    _id: null,
                    total_users: { $last: '$platform_stats.total_users' },
                    new_users: { $sum: '$platform_stats.new_users' },
                    new_posts: { $sum: '$platform_stats.new_posts' },
                    new_products: { $sum: '$platform_stats.new_products' },
                    new_orders: { $sum: '$platform_stats.new_orders' },
                    total_revenue: { $sum: '$platform_stats.total_revenue' },
                },
            },
        ]);

        console.log('📊 Weekly analytics summary:', weeklyStats[0] || 'No data');
        return weeklyStats[0] || null;
    } catch (error) {
        console.error('❌ Error aggregating weekly analytics:', error);
        throw error;
    }
};

/**
 * Calculate engagement metrics
 */
export const calculateEngagementMetrics = async () => {
    try {
        // Get top posts by engagement
        const topPosts = await Post.find()
            .sort({ likes_count: -1, comments_count: -1 })
            .limit(10)
            .populate('artisan', 'name');

        // Get top products by sales
        const topProducts = await Product.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'items.product',
                    as: 'orders',
                },
            },
            {
                $addFields: {
                    total_sales: { $size: '$orders' },
                },
            },
            { $sort: { total_sales: -1 } },
            { $limit: 10 },
        ]);

        // Get most active artisans
        const activeArtisans = await Post.aggregate([
            {
                $group: {
                    _id: '$artisan',
                    post_count: { $sum: 1 },
                    total_views: { $sum: '$view_count' },
                    total_likes: { $sum: '$likes_count' },
                },
            },
            { $sort: { post_count: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
        ]);

        console.log('📈 Engagement metrics calculated');
        return {
            topPosts,
            topProducts,
            activeArtisans,
        };
    } catch (error) {
        console.error('❌ Error calculating engagement metrics:', error);
        throw error;
    }
};

/**
 * Generate monthly report
 */
export const generateMonthlyReport = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const monthlyStats = await Analytics.aggregate([
            { $match: { date: { $gte: monthAgo, $lt: today } } },
            {
                $group: {
                    _id: null,
                    total_users: { $last: '$platform_stats.total_users' },
                    new_users: { $sum: '$platform_stats.new_users' },
                    new_posts: { $sum: '$platform_stats.new_posts' },
                    new_products: { $sum: '$platform_stats.new_products' },
                    new_orders: { $sum: '$platform_stats.new_orders' },
                    total_revenue: { $sum: '$platform_stats.total_revenue' },
                },
            },
        ]);

        const engagementMetrics = await calculateEngagementMetrics();

        const report = {
            period: {
                start: monthAgo,
                end: today,
            },
            summary: monthlyStats[0] || {},
            engagement: engagementMetrics,
            generatedAt: new Date(),
        };

        console.log('📋 Monthly report generated');
        return report;
    } catch (error) {
        console.error('❌ Error generating monthly report:', error);
        throw error;
    }
};

// Export for cron job setup
export default {
    aggregateDailyAnalytics,
    aggregateWeeklyAnalytics,
    calculateEngagementMetrics,
    generateMonthlyReport,
};
