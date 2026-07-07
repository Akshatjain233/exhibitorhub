import cron from 'node-cron';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Analytics from '../models/Analytics.js';
import { sendEmail } from '../services/emailService.js';
import ArtisanAnalytics from '../models/ArtisanAnalytics.js';
import Post from '../models/Post.js';
import Order from '../models/Order.js';
import ArtisanProfile from '../models/ArtisanProfile.js';

// Automation Jobs using node-cron
// These jobs run automatically at scheduled intervals

/**
 * Daily Payout Processing Job
 * Runs every day at 00:00 UTC
 * Processes eligible transactions and marks them as completed
 */
export const dailyPayoutJob = cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running daily payout job...');

    try {
        // Find all transactions pending payout (24h after order completion)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const eligiblePayouts = await Transaction.find({
            status: 'hold',
            type: { $in: ['Inbound', 'workshop_payment'] },
            createdAt: { $lte: oneDayAgo },
        }).populate('user related_user');

        console.log(`📊 Found ${eligiblePayouts.length} eligible payouts`);

        for (const transaction of eligiblePayouts) {
            // Process payout
            transaction.status = 'completed';
            transaction.processed_at = new Date();
            await transaction.save();

            // Notify user (if artisan)
            if (transaction.related_user && transaction.related_user.role === 'artisan') {
                await sendEmail({
                    to: transaction.related_user.email,
                    subject: 'Payment Released',
                    htmlContent: `
                        <p>Your payment of ₹${transaction.amount} has been released.</p>
                        <p>Transaction ID: ${transaction._id}</p>
                    `,
                }).catch((err) => console.error('Failed to send payout email:', err));
            }

            console.log(`✅ Processed payout: ${transaction._id} - ₹${transaction.amount}`);
        }

        console.log('✅ Daily payout job completed');
    } catch (error) {
        console.error('❌ Daily payout job error:', error);
    }
});

/**
 * Daily Analytics Aggregation Job
 * Runs every day at 01:00 UTC
 * Aggregates statistics for the previous day
 */
export const dailyAnalyticsJob = cron.schedule('0 1 * * *', async () => {
    console.log('📊 Running daily analytics aggregation...');

    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count new users
        const newUsers = await User.countDocuments({
            createdAt: { $gte: yesterday, $lt: today },
        });

        // Count new artisans
        const newArtisans = await User.countDocuments({
            role: 'artisan',
            createdAt: { $gte: yesterday, $lt: today },
        });

        // Calculate total revenue
        const revenueData = await Transaction.aggregate([
            {
                $match: {
                    type: 'platform_fee',
                    status: 'completed',
                    createdAt: { $gte: yesterday, $lt: today },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);

        const dailyRevenue = revenueData[0]?.total || 0;

        // Store analytics
        await Analytics.create({
            date: yesterday,
            new_users: newUsers,
            new_artisans: newArtisans,
            daily_revenue: dailyRevenue,
            aggregated_at: new Date(),
        });

        console.log(`✅ Analytics aggregated: ${newUsers} users, ₹${dailyRevenue} revenue`);
    } catch (error) {
        console.error('❌ Daily analytics job error:', error);
    }
});

/**
 * Daily Artisan Analytics Aggregation Job
 * Runs every day at 01:30 UTC
 * Aggregates per-artisan statistics for the previous day
 */
export const dailyArtisanAnalyticsJob = cron.schedule('30 1 * * *', async () => {
    console.log('📊 Running daily artisan analytics aggregation...');

    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all artisans
        const artisans = await User.find({ role: 'artisan', is_active: true });

        for (const artisan of artisans) {
            try {
                // Get daily views from posts
                const postsYesterday = await Post.find({
                    artisan: artisan._id,
                    createdAt: { $gte: yesterday, $lt: today },
                });

                const dailyViews = postsYesterday.reduce((sum, post) => sum + (post.view_count || 0), 0);
                const dailyLikes = postsYesterday.reduce((sum, post) => sum + (post.likes_count || 0), 0);
                const dailyShares = postsYesterday.reduce((sum, post) => sum + (post.shares_count || 0), 0);

                // Get daily orders
                const ordersYesterday = await Order.find({
                    artisan: artisan._id,
                    createdAt: { $gte: yesterday, $lt: today },
                });

                const dailyOrders = ordersYesterday.length;
                const dailyCompletedOrders = ordersYesterday.filter(
                    o => o.order_status === 'delivered'
                ).length;
                const dailyRevenue = ordersYesterday
                    .filter(o => o.order_status === 'delivered')
                    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

                // Get cumulative totals from ArtisanProfile
                const profile = await ArtisanProfile.findOne({ user: artisan._id });
                const cumulativeViews = profile?.total_views || 0;
                const cumulativeLikes = profile?.total_likes || 0;
                const cumulativeShares = profile?.total_shares || 0;

                // Get cumulative orders
                const allOrders = await Order.find({ artisan: artisan._id });
                const cumulativeOrders = allOrders.length;
                const cumulativeCompletedOrders = allOrders.filter(
                    o => o.order_status === 'delivered'
                ).length;
                const cumulativeRevenue = allOrders
                    .filter(o => o.order_status === 'delivered')
                    .reduce((sum, order) => sum + (order.total_amount || 0), 0);

                // Create or update analytics record
                await ArtisanAnalytics.updateOne(
                    { artisan: artisan._id, date: yesterday },
                    {
                        $set: {
                            artisan: artisan._id,
                            date: yesterday,
                            daily_views: dailyViews,
                            daily_likes: dailyLikes,
                            daily_shares: dailyShares,
                            daily_orders: dailyOrders,
                            daily_completed_orders: dailyCompletedOrders,
                            daily_revenue: dailyRevenue,
                            cumulative_views: cumulativeViews,
                            cumulative_likes: cumulativeLikes,
                            cumulative_shares: cumulativeShares,
                            cumulative_orders: cumulativeOrders,
                            cumulative_completed_orders: cumulativeCompletedOrders,
                            cumulative_revenue: cumulativeRevenue,
                        }
                    },
                    { upsert: true }
                );

                console.log(`  ✅ ${artisan.name}: ${dailyViews} views, ${dailyLikes} likes, ${dailyOrders} orders`);
            } catch (artisanError) {
                console.error(`  ❌ Error processing artisan ${artisan._id}:`, artisanError);
            }
        }

        console.log('✅ Artisan analytics aggregation completed');
    } catch (error) {
        console.error('❌ Artisan analytics aggregation error:', error);
    }
});


/**
 * Data Cleanup Job (GDPR Compliance)
 * Runs daily at 02:00 UTC
 * Permanently deletes users who requested deletion 30 days ago
 */
export const dataCleanupJob = cron.schedule('0 2 * * *', async () => {
    console.log('🗑️  Running GDPR data cleanup job...');

    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const usersToDelete = await User.find({
            deletion_requested_at: { $lte: thirtyDaysAgo },
            is_active: false,
        });

        console.log(`📊 Found ${usersToDelete.length} users marked for deletion`);

        for (const user of usersToDelete) {
            // Hard delete user and related data
            await User.findByIdAndDelete(user._id);
            // Note: In production, also delete related profiles, content, etc.

            console.log(`✅ Permanently deleted user: ${user.email}`);
        }

        console.log('✅ Data cleanup job completed');
    } catch (error) {
        console.error('❌ Data cleanup job error:', error);
    }
});

/**
 * Start all cron jobs
 */
export const startCronJobs = () => {
    console.log('🚀 Starting cron jobs...');

    dailyPayoutJob.start();
    console.log('  ✅ Daily Payout Job: Active (00:00 UTC)');

    dailyAnalyticsJob.start();
    console.log('  ✅ Daily Analytics Job: Active (01:00 UTC)');

    dailyArtisanAnalyticsJob.start();
    console.log('  ✅ Daily Artisan Analytics Job: Active (01:30 UTC)');

    dataCleanupJob.start();
    console.log('  ✅ Data Cleanup Job: Active (02:00 UTC)');
};

/**
 * Stop all cron jobs
 */
export const stopCronJobs = () => {
    dailyPayoutJob.stop();
    dailyAnalyticsJob.stop();
    dailyArtisanAnalyticsJob.stop();
    dataCleanupJob.stop();
    console.log('⏹️  All cron jobs stopped');
};

export default {
    startCronJobs,
    stopCronJobs,
};
