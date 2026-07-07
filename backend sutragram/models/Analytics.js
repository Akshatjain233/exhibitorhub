import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
        index: true,
    },
    new_users: {
        type: Number,
        default: 0,
    },
    new_artisans: {
        type: Number,
        default: 0,
    },
    new_consumers: {
        type: Number,
        default: 0,
    },
    daily_revenue: {
        type: Number,
        default: 0,
    },
    total_orders: {
        type: Number,
        default: 0,
    },
    aggregated_at: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
