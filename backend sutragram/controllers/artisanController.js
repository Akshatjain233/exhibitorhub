import ArtisanProfile from '../models/ArtisanProfile.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import CraftTag from '../models/CraftTag.js';

// @desc    Get artisan profile
// @route   GET /api/artisan/profile
// @access  Private (artisan only)
export const getArtisanProfile = async (req, res) => {
    try {
        const profile = await ArtisanProfile.findOne({ user: req.user._id })
            .populate('user', 'name phone_number email preferred_language')
            .populate('craft_tags', 'name_english name_vernacular type');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: { profile }
        });
    } catch (error) {
        console.error('Get artisan profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch artisan profile.',
            error: error.message
        });
    }
};

// @desc    Create or update artisan profile
// @route   PUT /api/artisan/profile
// @access  Private (artisan only)
export const updateArtisanProfile = async (req, res) => {
    try {
        const {
            bio_text,
            bio_audio_url,
            location_city,
            location_state,
            location_region,
            location_gps,
            craft_specialization
        } = req.body;

        const updateData = {};
        if (bio_text !== undefined) updateData.bio_text = bio_text;
        if (bio_audio_url !== undefined) updateData.bio_audio_url = bio_audio_url;
        if (location_city !== undefined) updateData.location_city = location_city;
        if (location_state !== undefined) updateData.location_state = location_state;
        if (location_region !== undefined) updateData.location_region = location_region;
        if (craft_specialization !== undefined) updateData.craft_specialization = craft_specialization;
        
        // Handle GPS coordinates
        if (location_gps && location_gps.longitude && location_gps.latitude) {
            updateData.location_gps = {
                type: 'Point',
                coordinates: [location_gps.longitude, location_gps.latitude]
            };
        }

        const profile = await ArtisanProfile.findOneAndUpdate(
            { user: req.user._id },
            updateData,
            { new: true, runValidators: true }
        ).populate('craft_tags', 'name_english name_vernacular type');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Artisan profile updated successfully.',
            data: { profile }
        });
    } catch (error) {
        console.error('Update artisan profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update artisan profile.',
            error: error.message
        });
    }
};

// @desc    Update "My Story" bio
// @route   PUT /api/artisan/bio
// @access  Private (artisan only)
export const updateBio = async (req, res) => {
    try {
        const { bio_text, bio_audio_url } = req.body;

        const updateData = {};
        if (bio_text !== undefined) updateData.bio_text = bio_text;
        if (bio_audio_url !== undefined) updateData.bio_audio_url = bio_audio_url;

        const profile = await ArtisanProfile.findOneAndUpdate(
            { user: req.user._id },
            updateData,
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Bio updated successfully.',
            data: {
                bio_text: profile.bio_text,
                bio_audio_url: profile.bio_audio_url
            }
        });
    } catch (error) {
        console.error('Update bio error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update bio.',
            error: error.message
        });
    }
};

// @desc    Update craft tags
// @route   PUT /api/artisan/craft-tags
// @access  Private (artisan only)
export const updateCraftTags = async (req, res) => {
    try {
        const { craft_tags } = req.body;

        if (!Array.isArray(craft_tags)) {
            return res.status(400).json({
                success: false,
                message: 'Craft tags must be an array.'
            });
        }

        if (craft_tags.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 craft tags allowed.'
            });
        }

        // Verify all tags exist
        const validTags = await CraftTag.find({ _id: { $in: craft_tags } });
        if (validTags.length !== craft_tags.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more invalid craft tags.'
            });
        }

        const profile = await ArtisanProfile.findOneAndUpdate(
            { user: req.user._id },
            { craft_tags },
            { new: true }
        ).populate('craft_tags', 'name_english name_vernacular type');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Craft tags updated successfully.',
            data: {
                craft_tags: profile.craft_tags
            }
        });
    } catch (error) {
        console.error('Update craft tags error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update craft tags.',
            error: error.message
        });
    }
};

// @desc    Link payment account
// @route   PUT /api/artisan/payment-account
// @access  Private (artisan only)
export const linkPaymentAccount = async (req, res) => {
    try {
        const { payment_upi_id, bank_account_number, bank_ifsc_code } = req.body;

        const updateData = {};
        if (payment_upi_id) updateData.payment_upi_id = payment_upi_id;
        if (bank_account_number) updateData.bank_account_number = bank_account_number;
        if (bank_ifsc_code) updateData.bank_ifsc_code = bank_ifsc_code;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide payment details.'
            });
        }

        // In production, verify the account with a test transaction
        // For now, just mark as verified
        updateData.payment_account_verified = true;

        const profile = await ArtisanProfile.findOneAndUpdate(
            { user: req.user._id },
            updateData,
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment account linked successfully.',
            data: {
                payment_upi_id: profile.payment_upi_id,
                bank_account_number: profile.bank_account_number ? '****' + profile.bank_account_number.slice(-4) : null,
                bank_ifsc_code: profile.bank_ifsc_code,
                payment_account_verified: profile.payment_account_verified
            }
        });
    } catch (error) {
        console.error('Link payment account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to link payment account.',
            error: error.message
        });
    }
};

// @desc    Get verification status
// @route   GET /api/artisan/verification-status
// @access  Private (artisan only)
export const getVerificationStatus = async (req, res) => {
    try {
        const profile = await ArtisanProfile.findOne({ user: req.user._id })
            .select('is_verified verification_status verification_date');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                is_verified: profile.is_verified,
                verification_status: profile.verification_status,
                verification_date: profile.verification_date
            }
        });
    } catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch verification status.',
            error: error.message
        });
    }
};

// @desc    Submit for verification
// @route   POST /api/artisan/submit-verification
// @access  Private (artisan only)
export const submitForVerification = async (req, res) => {
    try {
        const { verification_docs } = req.body;

        if (!verification_docs) {
            return res.status(400).json({
                success: false,
                message: 'Please provide verification documents.'
            });
        }

        const profile = await ArtisanProfile.findOneAndUpdate(
            { user: req.user._id },
            {
                verification_status: 'submitted',
                verification_docs
            },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification documents submitted successfully. You will be notified once reviewed.',
            data: {
                verification_status: profile.verification_status
            }
        });
    } catch (error) {
        console.error('Submit verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit verification.',
            error: error.message
        });
    }
};

// @desc    Get artisan analytics
// @route   GET /api/artisan/analytics
// @access  Private (artisan only)
export const getAnalytics = async (req, res) => {
    try {
        const profile = await ArtisanProfile.findOne({ user: req.user._id })
            .select('total_views total_likes total_shares rating_avg rating_count');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found.'
            });
        }

        // Import models
        const { default: Order } = await import('../models/Order.js');
        const { default: ArtisanAnalytics } = await import('../models/ArtisanAnalytics.js');
        
        // Get order statistics - query all orders for this artisan
        const orders = await Order.find({ artisan: req.user._id });
        console.log('[Analytics] Found orders for artisan:', req.user._id, 'Count:', orders.length);
        
        const totalOrders = orders.length;
        
        // Filter completed orders - check both status fields and payment_status
        const completedOrders = orders.filter(o => {
            const isDelivered = o.order_status === 'delivered';
            const isPaid = o.payment_status === 'completed' || o.payment_status === 'paid';
            return isDelivered && isPaid;
        }).length;
        
        // Calculate total revenue from completed/delivered orders with successful payment
        const totalRevenue = orders
            .filter(o => {
                const isDelivered = o.order_status === 'delivered';
                const isPaid = o.payment_status === 'completed' || o.payment_status === 'paid';
                return isDelivered && isPaid;
            })
            .reduce((sum, order) => {
                const amount = order.total_amount || 0;
                console.log('[Analytics] Order:', order._id, 'Status:', order.order_status, 'Payment:', order.payment_status, 'Amount:', amount);
                return sum + amount;
            }, 0);
        
        console.log('[Analytics] Revenue calculation:', {
            totalOrders,
            completedOrders,
            totalRevenue
        });

        // Calculate weekly trends from actual analytics data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get last 14 days of analytics (2 weeks for comparison)
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const analyticsData = await ArtisanAnalytics.find({
            artisan: req.user._id,
            date: { $gte: twoWeeksAgo, $lte: today }
        }).sort({ date: 1 });

        // Group data into this week and last week
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const thisWeekData = analyticsData.filter(d => d.date >= sevenDaysAgo);
        const lastWeekData = analyticsData.filter(d => d.date < sevenDaysAgo && d.date >= twoWeeksAgo);

        // Initialize weekly arrays
        const weeklyViews = [];
        const weeklyLikes = [];
        const weeklyOrders = [];

        // Fill in the last 7 days (one entry per day)
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

        // Calculate percentage changes (this week vs last week)
        const calcPercentageChange = (thisWeek, lastWeek) => {
            const thisWeekSum = thisWeek.reduce((a, b) => a + b, 0);
            const lastWeekSum = lastWeek.reduce((a, b) => a + b, 0);
            
            if (lastWeekSum === 0) {
                return thisWeekSum > 0 ? 100 : 0;
            }
            
            return Math.round(((thisWeekSum - lastWeekSum) / lastWeekSum) * 100);
        };

        const likesChange = calcPercentageChange(
            analyticsData.filter(d => d.date >= sevenDaysAgo).map(d => d.daily_likes),
            lastWeekData.map(d => d.daily_likes)
        );

        const sharesChange = calcPercentageChange(
            analyticsData.filter(d => d.date >= sevenDaysAgo).map(d => d.daily_shares),
            lastWeekData.map(d => d.daily_shares)
        );

        const trends = {
            weekly: {
                views: weeklyViews,
                likes: weeklyLikes,
                orders: weeklyOrders,
            },
            percentageChanges: {
                likes: likesChange,
                shares: sharesChange,
            }
        };

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalViews: profile.total_views || 0,
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
                trends,
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics.',
            error: error.message
        });
    }
};

// @desc    Get public artisan profile by ID
// @route   GET /api/artisan/:artisanId
// @access  Public
export const getPublicArtisanProfile = async (req, res) => {
    try {
        const id = req.params.artisanId || req.params.id; // Support both /:artisanId and /:id route params
        console.log('[Artisan] Fetching public profile for User ID:', id);

        // Find ArtisanProfile by User ID (not by Profile ID)
        const profile = await ArtisanProfile.findOne({ user: id })
            .populate('user', 'name profile_image_url experience_years preferred_language')
            .populate('craft_tags', 'name_english name_vernacular type');

        if (!profile) {
            console.log('[Artisan] ArtisanProfile not found for User ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Artisan profile not found.'
            });
        }

        const user = await User.findById(id);
        if (!user || !user.is_active) {
            console.log('[Artisan] User not found or inactive:', id);
            return res.status(404).json({
                success: false,
                message: 'Artisan not available.'
            });
        }

        // Fetch video count
        const videoCount = await Post.countDocuments({ artisan: user._id });

        // Return only public information
        res.status(200).json({
            success: true,
            data: {
                _id: profile._id,
                user_id: user._id,
                name: user.name,
                profile_image_url: user.profile_image_url,
                bio_english: profile.bio_text,
                location_city: profile.location_city,
                location_state: profile.location_state,
                location_region: profile.location_region,
                craft_tags: profile.craft_tags,
                craft_specialization: profile.craft_specialization,
                is_verified: profile.is_verified,
                rating_average: profile.rating_avg,
                rating_count: profile.rating_count,
                experience_years: user.experience_years || 0,
                published_videos_count: videoCount,
                followers_count: profile.followers_count || 0,
                following_count: profile.following_count || 0,
                total_views: profile.total_views || 0,
                total_likes: profile.total_likes || 0
            }
        });
    } catch (error) {
        console.error('[Artisan] Get public artisan profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch artisan profile.',
            error: error.message
        });
    }
};

// @desc    Search artisans
// @route   GET /api/artisan/search
// @access  Public
export const searchArtisans = async (req, res) => {
    try {
        const { 
            craft_tags, 
            location_city, 
            location_state, 
            is_verified,
            page = 1,
            limit = 20 
        } = req.query;

        const query = {};
        
        if (craft_tags) {
            query.craft_tags = { $in: craft_tags.split(',') };
        }
        if (location_city) {
            query.location_city = new RegExp(location_city, 'i');
        }
        if (location_state) {
            query.location_state = new RegExp(location_state, 'i');
        }
        if (is_verified !== undefined) {
            query.is_verified = is_verified === 'true';
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const artisans = await ArtisanProfile.find(query)
            .populate('user', 'name preferred_language is_active')
            .populate('craft_tags', 'name_english name_vernacular type')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ rating_avg: -1, total_views: -1 });

        // Filter out inactive users
        const activeArtisans = artisans.filter(artisan => artisan.user && artisan.user.is_active);

        const total = await ArtisanProfile.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                artisans: activeArtisans,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Search artisans error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search artisans.',
            error: error.message
        });
    }
};

// @desc    Trigger manual analytics aggregation
// @route   POST /api/artisan/analytics/aggregate
// @access  Private (artisan only)
export const triggerAnalyticsAggregation = async (req, res) => {
    try {
        const { default: ArtisanAnalytics } = await import('../models/ArtisanAnalytics.js');
        const { default: Order } = await import('../models/Order.js');
        const artisanId = req.user._id;

        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        // Get today's date for range query
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get daily views/likes/shares from posts
        const postsYesterday = await Post.find({
            artisan: artisanId,
            createdAt: { $gte: yesterday, $lt: today },
        });

        const dailyViews = postsYesterday.reduce((sum, post) => sum + (post.view_count || 0), 0);
        const dailyLikes = postsYesterday.reduce((sum, post) => sum + (post.likes_count || 0), 0);
        const dailyShares = postsYesterday.reduce((sum, post) => sum + (post.shares_count || 0), 0);

        // Get daily orders
        const ordersYesterday = await Order.find({
            artisan: artisanId,
            createdAt: { $gte: yesterday, $lt: today },
        });

        const dailyOrders = ordersYesterday.length;
        const dailyCompletedOrders = ordersYesterday.filter(
            o => o.status === 'Completed' || o.order_status === 'delivered'
        ).length;
        const dailyRevenue = ordersYesterday
            .filter(o => o.status === 'Completed' || o.order_status === 'delivered')
            .reduce((sum, order) => sum + (order.total_amount || 0), 0);

        // Get cumulative totals
        const profile = await ArtisanProfile.findOne({ user: artisanId });
        const cumulativeViews = profile?.total_views || 0;
        const cumulativeLikes = profile?.total_likes || 0;
        const cumulativeShares = profile?.total_shares || 0;

        // Get all cumulative orders
        const allOrders = await Order.find({ artisan: artisanId });
        const cumulativeOrders = allOrders.length;
        const cumulativeCompletedOrders = allOrders.filter(
            o => o.status === 'Completed' || o.order_status === 'delivered'
        ).length;
        const cumulativeRevenue = allOrders
            .filter(o => o.status === 'Completed' || o.order_status === 'delivered')
            .reduce((sum, order) => sum + (order.total_amount || 0), 0);

        // Create or update analytics record
        const analyticsRecord = await ArtisanAnalytics.findOneAndUpdate(
            { artisan: artisanId, date: yesterday },
            {
                $set: {
                    artisan: artisanId,
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
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Analytics aggregated successfully',
            data: {
                date: yesterday.toISOString().split('T')[0],
                daily: {
                    views: dailyViews,
                    likes: dailyLikes,
                    shares: dailyShares,
                    orders: dailyOrders,
                    completedOrders: dailyCompletedOrders,
                    revenue: dailyRevenue,
                },
                cumulative: {
                    views: cumulativeViews,
                    likes: cumulativeLikes,
                    shares: cumulativeShares,
                    orders: cumulativeOrders,
                    completedOrders: cumulativeCompletedOrders,
                    revenue: cumulativeRevenue,
                }
            }
        });
    } catch (error) {
        console.error('Trigger analytics aggregation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to trigger analytics aggregation.',
            error: error.message
        });
    }
};
