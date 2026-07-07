import cron from 'node-cron';
import {
    aggregateDailyAnalytics,
    aggregateWeeklyAnalytics,
    generateMonthlyReport,
} from '../jobs/analyticsJobs.js';
import { resetSupplierMonthlyLeadCredits } from '../jobs/monthlyLeadReset.js';
import { markStaleLeads } from '../jobs/markStaleLeads.js';

/**
 * Setup all cron jobs
 */
export const setupCronJobs = () => {
    // Daily analytics aggregation - runs at 1 AM every day
    cron.schedule('0 1 * * *', async () => {
        console.log('🕐 Running daily analytics aggregation...');
        try {
            await aggregateDailyAnalytics();
            console.log('✅ Daily analytics completed');
        } catch (error) {
            console.error('❌ Daily analytics failed:', error);
        }
    });

    // Weekly analytics aggregation - runs at 2 AM every Monday
    cron.schedule('0 2 * * 1', async () => {
        console.log('🕐 Running weekly analytics aggregation...');
        try {
            await aggregateWeeklyAnalytics();
            console.log('✅ Weekly analytics completed');
        } catch (error) {
            console.error('❌ Weekly analytics failed:', error);
        }
    });

    // Monthly report generation - runs at 3 AM on the 1st of every month
    cron.schedule('0 3 1 * *', async () => {
        console.log('🕐 Generating monthly report...');
        try {
            const report = await generateMonthlyReport();
            console.log('✅ Monthly report generated:', report);
        } catch (error) {
            console.error('❌ Monthly report generation failed:', error);
        }
    });

    // Supplier free-tier lead credits reset - runs at 4 AM on the 1st of every month
    cron.schedule('0 4 1 * *', async () => {
        console.log('🕐 Resetting supplier monthly lead credits...');
        try {
            const result = await resetSupplierMonthlyLeadCredits();
            console.log('✅ Supplier lead credits reset completed:', result);
        } catch (error) {
            console.error('❌ Supplier lead credits reset failed:', error);
        }
    });

    // Stale lead marker - runs daily at 4:30 AM
    cron.schedule('30 4 * * *', async () => {
        console.log('🕐 Marking stale artisan leads...');
        try {
            const result = await markStaleLeads(180);
            console.log('✅ Stale lead marking completed:', result);
        } catch (error) {
            console.error('❌ Stale lead marking failed:', error);
        }
    });

    console.log('✅ Cron jobs scheduled successfully');
};

export default setupCronJobs;
