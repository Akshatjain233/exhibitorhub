import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import Order from '../models/Order.js';
import Post from '../models/Post.js';
import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose'; 

const sanitizeImageValue = (value) => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const lowered = trimmed.toLowerCase();
    if (lowered === 'null' || lowered === 'undefined' || lowered === 'nan') return null;
    return trimmed;
};

const firstValidImage = (...candidateGroups) => {
    for (const candidateGroup of candidateGroups) {
        const values = Array.isArray(candidateGroup) ? candidateGroup : [candidateGroup];
        for (const value of values) {
            const sanitized = sanitizeImageValue(value);
            if (sanitized) return sanitized;
        }
    }
    return null;
};

const sanitizeImageArray = (values) => {
    if (!Array.isArray(values)) return [];
    return values
        .map((value) => sanitizeImageValue(value))
        .filter(Boolean);
};

const getHealthSnapshot = () => {
    const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };

    const databaseState = dbStates[mongoose.connection.readyState] || 'unknown';
    const status = databaseState === 'connected' ? 'healthy' : 'degraded';

    return {
        status,
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        node_version: process.version,
        database: databaseState,
    };
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (admin only)
export const getDashboardStats = async (req, res) => {
    try {
        // User statistics
        const totalUsers = await User.countDocuments();
        const artisanCount = await User.countDocuments({ role: 'artisan' });
        const consumerCount = await User.countDocuments({ role: 'consumer' });
        const traderCount = await User.countDocuments({ role: 'trader' });

        // Content statistics
        const totalVideos = await Post.countDocuments();
        const totalViews = await Post.aggregate([
            { $group: { _id: null, total: { $sum: '$view_count' } } }
        ]);

        // Order statistics
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ order_status: 'placed' });
        const completedOrders = await Order.countDocuments({ order_status: 'delivered' });

        // Revenue statistics
        const totalRevenue = await Transaction.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const platformFees = await Transaction.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$platform_fee_amount' } } }
        ]);

        // Verification statistics
        const verifiedArtisans = await ArtisanProfile.countDocuments({ is_verified: true });
        const pendingVerifications = await ArtisanProfile.countDocuments({ verification_status: 'submitted' });

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    artisans: artisanCount,
                    consumers: consumerCount,
                    traders: traderCount,
                },
                content: {
                    totalVideos,
                    totalViews: totalViews[0]?.total || 0,
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    completed: completedOrders,
                },
                revenue: {
                    total: totalRevenue[0]?.total || 0,
                    platformFees: platformFees[0]?.total || 0,
                },
                verifications: {
                    verified: verifiedArtisans,
                    pending: pendingVerifications,
                },
            },
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics.',
            error: error.message,
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const { role, is_active, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (role) query.role = role;
        if (is_active !== undefined) query.is_active = is_active === 'true';

        const users = await User.find(query)
            .select('-password_hash')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users.',
            error: error.message,
        });
    }
};

// @desc    Deactivate/activate user account
// @route   PUT /api/admin/users/:userId/toggle-active
// @access  Private (admin only)
export const toggleUserActive = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        user.is_active = !user.is_active;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully.`,
            data: { user },
        });
    } catch (error) {
        console.error('Toggle user active error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle user status.',
            error: error.message,
        });
    }
};

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private (admin only)
export const getSystemHealth = async (req, res) => {
    try {
        const health = getHealthSnapshot();

        res.status(200).json({
            success: true,
            data: health,
        });
    } catch (error) {
        console.error('Get system health error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system health.',
            error: error.message,
        });
    }
};

// @desc    Get verification queue (pending artisan verifications)
// @route   GET /api/admin/verification-queue
// @access  Private (admin only)
export const getVerificationQueue = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'submitted' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const verifications = await ArtisanProfile.find({ verification_status: status })
            .populate('user_id', 'name email phone_number')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await ArtisanProfile.countDocuments({ verification_status: status });

        res.status(200).json({
            success: true,
            data: {
                verifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get verification queue error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch verification queue.',
            error: error.message,
        });
    }
};

// @desc    Get active users
// @route   GET /api/admin/users/active
// @access  Private (admin only)
export const getActiveUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find({ is_active: true })
            .select('-password_hash')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments({ is_active: true });

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get active users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active users.',
            error: error.message,
        });
    }
};

// @desc    Get inactive users
// @route   GET /api/admin/users/inactive
// @access  Private (admin only)
export const getInactiveUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find({ is_active: false })
            .select('-password_hash')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments({ is_active: false });

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get inactive users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inactive users.',
            error: error.message,
        });
    }
};

// @desc    Check system health
// @route   GET /api/admin/system/health
// @access  Private (admin only)
export const checkSystemHealth = async (req, res) => {
    try {
        const health = getHealthSnapshot();

        res.status(200).json({
            success: true,
            data: health,
        });
    } catch (error) {
        console.error('Check system health error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check system health.',
            error: error.message,
        });
    }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (admin only)
export const getPlatformAnalytics = async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const completedStatuses = ['Completed', 'completed'];
        
        // Calculate date range based on period
        const now = new Date();
        let startDate;
        
        switch(period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'month':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Revenue analytics
        const totalRevenue = await Transaction.aggregate([
            { $match: { status: { $in: completedStatuses } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const monthlyRevenue = await Transaction.aggregate([
            { 
                $match: { 
                    status: { $in: completedStatuses },
                    createdAt: { $gte: startDate }
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const previousMonthStart = new Date(startDate);
        previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
        
        const previousMonthRevenue = await Transaction.aggregate([
            { 
                $match: { 
                    status: { $in: completedStatuses },
                    createdAt: { $gte: previousMonthStart, $lt: startDate }
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const currentRevenue = monthlyRevenue[0]?.total || 0;
        const previousRevenue = previousMonthRevenue[0]?.total || 0;
        const growth = previousRevenue > 0 
            ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
            : 0;

        // Build chart data from actual transactions in the selected period.
        const transactionSeries = await Transaction.find({
            status: { $in: completedStatuses },
            createdAt: { $gte: startDate, $lte: now },
        }).select('amount createdAt');

        let chartData;
        if (period === 'week') {
            const buckets = Array(7).fill(0);
            transactionSeries.forEach((tx) => {
                const diffDays = Math.floor((now - tx.createdAt) / (24 * 60 * 60 * 1000));
                const idx = 6 - diffDays;
                if (idx >= 0 && idx < 7) {
                    buckets[idx] += tx.amount || 0;
                }
            });
            chartData = buckets;
        } else if (period === 'year') {
            const buckets = Array(12).fill(0);
            transactionSeries.forEach((tx) => {
                const month = new Date(tx.createdAt).getMonth();
                if (month >= 0 && month < 12) {
                    buckets[month] += tx.amount || 0;
                }
            });
            chartData = buckets;
        } else {
            const buckets = Array(4).fill(0);
            transactionSeries.forEach((tx) => {
                const diffDays = Math.floor((now - tx.createdAt) / (24 * 60 * 60 * 1000));
                const idx = 3 - Math.floor(diffDays / 7);
                if (idx >= 0 && idx < 4) {
                    buckets[idx] += tx.amount || 0;
                }
            });
            chartData = buckets;
        }

        // User analytics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ is_active: true });
        const newUsers = await User.countDocuments({ 
            createdAt: { $gte: startDate }
        });

        const usersByRole = {
            artisan: await User.countDocuments({ role: 'artisan' }),
            consumer: await User.countDocuments({ role: 'consumer' }),
            trader: await User.countDocuments({ role: 'trader' }),
        };

        // Content analytics
        const totalVideos = await Post.countDocuments();
        const totalViews = await Post.aggregate([
            { $group: { _id: null, total: { $sum: '$view_count' } } }
        ]);
        const avgViewsPerVideo = totalVideos > 0 
            ? Math.round((totalViews[0]?.total || 0) / totalVideos)
            : 0;

        // Order analytics
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ order_status: 'delivered' });
        const pendingOrders = await Order.countDocuments({ order_status: 'placed' });
        const cancelledOrders = await Order.countDocuments({ order_status: 'cancelled' });

        res.status(200).json({
            success: true,
            data: {
                revenue: {
                    total: totalRevenue[0]?.total || 0,
                    monthly: currentRevenue,
                    growth: parseFloat(growth),
                    chartData,
                },
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    new: newUsers,
                    byRole: usersByRole,
                },
                content: {
                    totalVideos,
                    totalViews: totalViews[0]?.total || 0,
                    avgViewsPerVideo,
                },
                orders: {
                    total: totalOrders,
                    completed: completedOrders,
                    pending: pendingOrders,
                    cancelled: cancelledOrders,
                },
            },
        });
    } catch (error) {
        console.error('Get platform analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch platform analytics.',
            error: error.message,
        });
    }
};

// @desc    Get all posts for admin
// @route   GET /api/admin/posts
// @access  Private (admin only)
export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        let query = {};
        if (status === 'verified') {
            query.is_verified = true;
        } else if (status === 'unverified') {
            query.is_verified = false;
        }

        const posts = await Post.find(query)
            .populate('artisan', 'name email')
            .skip(skip)
            .limit(parsedLimit)
            .sort({ createdAt: -1 });

        const normalizedPosts = posts.map((postDoc) => {
            const post = postDoc.toObject();
            const displayThumbnail = firstValidImage(
                post.thumbnail_url,
                post.media_url,
                post.video_url_480p,
                post.video_url_720p,
                post.video_url_1080p,
                post.video_url_original
            );

            return {
                ...post,
                thumbnail_url: displayThumbnail,
                display_thumbnail: displayThumbnail,
                media_url: sanitizeImageValue(post.media_url),
            };
        });

        const total = await Post.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                posts: normalizedPosts,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    pages: Math.ceil(total / parsedLimit),
                },
            },
        });
    } catch (error) {
        console.error('Get all posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch posts.',
            error: error.message,
        });
    }
};

// @desc    Verify a post
// @route   POST /api/admin/posts/:id/verify
// @access  Private (admin only)
export const verifyPost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.',
            });
        }

        post.is_verified = true;
        post.verified_by = req.user._id;
        post.verified_at = new Date();
        await post.save();

        res.status(200).json({
            success: true,
            message: 'Post verified successfully.',
            data: { post },
        });
    } catch (error) {
        console.error('Verify post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify post.',
            error: error.message,
        });
    }
};

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private (admin only)
export const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        let query = {};
        if (status === 'verified') {
            query.is_verified = true;
        } else if (status === 'unverified') {
            query.is_verified = false;
        }

        const products = await Product.find(query)
            .populate('artisan', 'name email')
            .skip(skip)
            .limit(parsedLimit)
            .sort({ createdAt: -1 });

        const normalizedProducts = products.map((productDoc) => {
            const product = productDoc.toObject();
            const sanitizedImages = sanitizeImageArray(product.images);
            const displayThumbnail = firstValidImage(
                sanitizedImages,
                product.image_url,
                product.thumbnail_url
            );

            return {
                ...product,
                images: sanitizedImages,
                display_thumbnail: displayThumbnail,
            };
        });

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                products: normalizedProducts,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    pages: Math.ceil(total / parsedLimit),
                },
            },
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products.',
            error: error.message,
        });
    }
};

// @desc    Verify a product
// @route   POST /api/admin/products/:id/verify
// @access  Private (admin only)
export const verifyProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        product.is_verified = true;
        product.verified_by = req.user._id;
        product.verified_at = new Date();
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product verified successfully.',
            data: { product },
        });
    } catch (error) {
        console.error('Verify product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify product.',
            error: error.message,
        });
    }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private (admin only)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully.',
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product.',
            error: error.message,
        });
    }
};
