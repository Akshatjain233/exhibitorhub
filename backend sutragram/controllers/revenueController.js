import Transaction from '../models/Transaction.js';

const COMPLETED_STATUSES = ['completed', 'Completed'];

const getDateRangeFilter = ({ period, start_date, end_date }) => {
    if (start_date || end_date) {
        const range = {};
        if (start_date) range.$gte = new Date(start_date);
        if (end_date) range.$lte = new Date(end_date);
        return Object.keys(range).length > 0 ? range : null;
    }

    if (!period) {
        return null;
    }

    const now = new Date();
    let from;

    switch (period) {
        case 'week':
            from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'year':
            from = new Date(now.getFullYear(), 0, 1);
            break;
        case 'month':
        default:
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
    }

    return { $gte: from, $lte: now };
};

// @desc    Get revenue report
// @route   GET /api/revenue/report
// @access  Private (admin only)
export const getRevenueReport = async (req, res) => {
    try {
        const { period, start_date, end_date } = req.query;

        const query = {
            status: { $in: COMPLETED_STATUSES },
        };

        const createdAt = getDateRangeFilter({ period, start_date, end_date });
        if (createdAt) {
            query.createdAt = createdAt;
        }

        // Total revenue
        const totalRevenue = await Transaction.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Platform fees
        const platformFees = await Transaction.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$platform_fee_amount' } } }
        ]);

        // Artisan payouts
        const artisanPayouts = await Transaction.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: '$payout_amount' } } }
        ]);

        // Order revenue
        const orderRevenue = await Transaction.aggregate([
            { $match: { ...query, type: 'Inbound' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Workshop revenue (if applicable)
        const workshopRevenue = await Transaction.aggregate([
            { $match: { ...query, type: 'workshop_payment' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: totalRevenue[0]?.total || 0,
                platformFees: platformFees[0]?.total || 0,
                artisanPayouts: artisanPayouts[0]?.total || 0,
                breakdown: {
                    orders: orderRevenue[0]?.total || 0,
                    workshops: workshopRevenue[0]?.total || 0,
                },
            },
        });
    } catch (error) {
        console.error('Get revenue report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue report.',
            error: error.message,
        });
    }
};

// @desc    Get artisan growth fund allocation
// @route   GET /api/revenue/growth-fund
// @access  Private (admin only)
export const getGrowthFundAllocation = async (req, res) => {
    try {
        // Calculate total platform fees
        const platformFees = await Transaction.aggregate([
            { $match: { status: { $in: COMPLETED_STATUSES } } },
            { $group: { _id: null, total: { $sum: '$platform_fee' } } }
        ]);

        const totalFees = platformFees[0]?.total || 0;

        // Allocate 20% to growth fund (example)
        const growthFund = totalFees * 0.20;

        res.status(200).json({
            success: true,
            data: {
                totalPlatformFees: totalFees,
                growthFundAllocation: growthFund,
                allocationPercentage: 20,
            },
        });
    } catch (error) {
        console.error('Get growth fund error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate growth fund allocation.',
            error: error.message,
        });
    }
};

// @desc    Get platform fee management
// @route   GET /api/revenue/platform-fees
// @access  Private (admin only)
export const getPlatformFees = async (req, res) => {
    try {
        const fees = await Transaction.find({ status: { $in: COMPLETED_STATUSES } })
            .select('amount platform_fee createdAt type status')
            .sort({ createdAt: -1 })
            .limit(100);

        const summary = {
            totalTransactions: fees.length,
            totalPlatformFees: fees.reduce((sum, t) => sum + (t.platform_fee || 0), 0),
            averageFeePercent: fees.length > 0
                ? (fees.reduce((sum, t) => sum + (t.platform_fee || 0), 0) /
                    Math.max(fees.reduce((sum, t) => sum + (t.amount || 0), 0), 1)) * 100
                : 0,
        };

        res.status(200).json({
            success: true,
            data: {
                summary,
                recentFees: fees,
            },
        });
    } catch (error) {
        console.error('Get platform fees error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch platform fees.',
            error: error.message,
        });
    }
};

// @desc    Get recent revenue transactions
// @route   GET /api/admin/revenue/transactions
// @access  Private (admin only)
export const getRecentTransactions = async (req, res) => {
    try {
        const { period, start_date, end_date, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const query = {
            status: { $in: COMPLETED_STATUSES },
        };

        const createdAt = getDateRangeFilter({ period, start_date, end_date });
        if (createdAt) {
            query.createdAt = createdAt;
        }

        const transactions = await Transaction.find(query)
            .select('amount status type platform_fee description createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit, 10));

        const total = await Transaction.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    total,
                    pages: Math.ceil(total / parseInt(limit, 10)),
                },
            },
        });
    } catch (error) {
        console.error('Get recent transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent transactions.',
            error: error.message,
        });
    }
};

// @desc    Get revenue source breakdown
// @route   GET /api/admin/revenue/sources
// @access  Private (admin only)
export const getRevenueSources = async (req, res) => {
    try {
        const { period, start_date, end_date } = req.query;

        const query = {
            status: { $in: COMPLETED_STATUSES },
        };

        const createdAt = getDateRangeFilter({ period, start_date, end_date });
        if (createdAt) {
            query.createdAt = createdAt;
        }

        const grouped = await Transaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                },
            },
            { $sort: { total: -1 } },
        ]);

        const grandTotal = grouped.reduce((sum, item) => sum + (item.total || 0), 0);
        const sources = grouped.map((item) => ({
            source: item._id || 'unknown',
            total: item.total || 0,
            percentage: grandTotal > 0 ? ((item.total || 0) / grandTotal) * 100 : 0,
        }));

        res.status(200).json({
            success: true,
            data: {
                sources,
                total: grandTotal,
            },
        });
    } catch (error) {
        console.error('Get revenue sources error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue sources.',
            error: error.message,
        });
    }
};
