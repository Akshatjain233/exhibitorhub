import mongoose from 'mongoose';

const artisanAnalyticsSchema = new mongoose.Schema({
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    
    // Daily metrics
    daily_views: {
        type: Number,
        default: 0,
    },
    daily_likes: {
        type: Number,
        default: 0,
    },
    daily_shares: {
        type: Number,
        default: 0,
    },
    daily_orders: {
        type: Number,
        default: 0,
    },
    daily_completed_orders: {
        type: Number,
        default: 0,
    },
    daily_revenue: {
        type: Number,
        default: 0,
    },
    
    // Cumulative totals up to this date
    cumulative_views: {
        type: Number,
        default: 0,
    },
    cumulative_likes: {
        type: Number,
        default: 0,
    },
    cumulative_shares: {
        type: Number,
        default: 0,
    },
    cumulative_orders: {
        type: Number,
        default: 0,
    },
    cumulative_completed_orders: {
        type: Number,
        default: 0,
    },
    cumulative_revenue: {
        type: Number,
        default: 0,
    },
    
    // Compound Index for artisan and date
    // Allows efficient queries for getting last N days of analytics
}, { timestamps: true });

// Compound index for artisan + date (most common query pattern)
artisanAnalyticsSchema.index({ artisan: 1, date: -1 });

// Index for date range queries
artisanAnalyticsSchema.index({ date: -1 });

// Unique constraint to prevent duplicate records for same artisan on same day
artisanAnalyticsSchema.index({ artisan: 1, date: 1 }, { unique: true });

const ArtisanAnalytics = mongoose.model('ArtisanAnalytics', artisanAnalyticsSchema);

export default ArtisanAnalytics;
