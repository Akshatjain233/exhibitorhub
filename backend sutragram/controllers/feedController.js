import Post from '../models/Post.js';
import Product from '../models/Product.js';
import RawMaterial from '../models/RawMaterial.js';
import ConsumerProfile from '../models/ConsumerProfile.js';
import { getActiveAds, recordImpression } from '../services/adService.js';

// @desc    Get personalized feed
// @route   GET /api/feed/personalized
// @access  Private
export const getPersonalizedFeed = async (req, res) => {
    try {
        const { page = 1, limit = 20, include_ads = true } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let posts;

        if (req.user.role === 'consumer') {
            // Get consumer preferences
            const consumerProfile = await ConsumerProfile.findOne({ user: req.user._id });

            const query = (consumerProfile && consumerProfile.craft_preferences.length > 0)
                ? { 'tags.tag': { $in: consumerProfile.craft_preferences } }
                : {};

            posts = await Post.find(query)
                .populate({
                    path: 'artisan',
                    select: 'name profile_picture',
                    populate: { path: 'profile', select: 'location_city craft_specialization' }
                })
                .populate('tags.tag', 'name_english name_vernacular')
                .select('-products -product_links')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ view_count: -1, createdAt: -1 })
                .lean();
        } else {
            // For non-consumers, show general trending content
            posts = await Post.find()
                .populate({
                    path: 'artisan',
                    select: 'name profile_picture',
                    populate: { path: 'profile', select: 'location_city craft_specialization' }
                })
                .populate('tags.tag', 'name_english name_vernacular')
                .select('-products -product_links')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ view_count: -1, createdAt: -1 })
                .lean();
        }

        // Flatten artisan profile fields and normalize profile picture
        posts = posts.map(post => {
            if (post.artisan) {
                if (post.artisan.profile_picture && !post.artisan.profile_image_url) {
                    post.artisan.profile_image_url = post.artisan.profile_picture;
                }
                if (post.artisan.profile) {
                    post.artisan.location_city = post.artisan.profile.location_city;
                    post.artisan.craft_specialization = post.artisan.profile.craft_specialization;
                    delete post.artisan.profile;
                }
            }
            return post;
        });

        // Insert ads into feed if requested
        if (include_ads === 'true' || include_ads === true) {
            const ad = await getActiveAds('feed', { role: req.user.role });
            if (ad) {
                // Record impression
                recordImpression(ad._id).catch(err => console.log('Error recording impression:', err));
                
                // Insert ad after every 5 posts
                const postsWithAds = [];
                posts.forEach((post, index) => {
                    postsWithAds.push(post);
                    if ((index + 1) % 5 === 0) {
                        postsWithAds.push({
                            _id: `ad_${ad._id}`,
                            is_advertisement: true,
                            title: ad.title,
                            description: ad.description,
                            media_url: ad.media.url,
                            call_to_action: ad.call_to_action,
                            sponsored: true,
                        });
                    }
                });
                posts = postsWithAds;
            }
        }

        const total = await Post.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                posts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feed.',
            error: error.message,
        });
    }
};

// @desc    Get trending content
// @route   GET /api/content/feed/trending
// @access  Public
export const getTrendingFeed = async (req, res) => {
    try {
        const { page = 1, limit = 20, timeframe = 'week' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Calculate date filter based on timeframe
        let dateFilter = {};
        const now = new Date();
        switch (timeframe) {
            case 'day':
                dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
                break;
            case 'week':
                dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
                break;
            case 'month':
                dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
                break;
            default:
                dateFilter = {};
        }

        const postsData = await Post.find(dateFilter)
            .populate({
                path: 'artisan',
                select: 'name profile_picture',
                populate: { path: 'profile', select: 'location_city craft_specialization' }
            })
            .populate('tags.tag', 'name_english name_vernacular')
            .select('-products -product_links')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ view_count: -1, createdAt: -1 })
            .lean();

        // Flatten artisan profile fields and normalize profile picture
        const posts = postsData.map(post => {
            if (post.artisan) {
                if (post.artisan.profile_picture && !post.artisan.profile_image_url) {
                    post.artisan.profile_image_url = post.artisan.profile_picture;
                }
                if (post.artisan.profile) {
                    post.artisan.location_city = post.artisan.profile.location_city;
                    post.artisan.craft_specialization = post.artisan.profile.craft_specialization;
                    delete post.artisan.profile;
                }
            }
            return post;
        });

        const total = await Post.countDocuments(dateFilter);

        res.status(200).json({
            success: true,
            data: {
                posts,
                timeframe,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get trending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trending content.',
            error: error.message,
        });
    }
};

// @desc    Get feed by craft tag
// @route   GET /api/feed/tag/:tagId
// @access  Public
export const getFeedByTag = async (req, res) => {
    try {
        const { tagId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await Post.find({ 'tags.tag': tagId })
            .populate('artisan', 'name')
            .populate('tags.tag', 'name_english name_vernacular')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ view_count: -1, createdAt: -1 });

        const total = await Post.countDocuments({ 'tags.tag': tagId });

        res.status(200).json({
            success: true,
            data: {
                posts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get feed by tag error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feed by tag.',
            error: error.message,
        });
    }
};

// @desc    Unified home feed — mixes posts, products, and raw materials
// @route   GET /api/v1/feed
// @access  Public  (auth optional — used to personalise)
// @query   type: 'all' | 'posts' | 'products' | 'rawmaterials'
//          page: number (default 1)
//          limit: number per type per page (default 15)
export const getUnifiedFeed = async (req, res) => {
    try {
        const { type = 'all', page = 1, limit = 15 } = req.query;
        const pageNum = parseInt(page);
        const lim = parseInt(limit);
        const skip = (pageNum - 1) * lim;

        const fetchPosts = async (sourceSkip = skip, sourceLimit = lim) => {
            const raw = await Post.find({})
                .populate({
                    path: 'artisan',
                    select: 'name profile_picture',
                    populate: { path: 'profile', select: 'location_city craft_specialization' },
                })
                .populate('tags.tag', 'name_english name_vernacular')
                .select('-products -product_links')
                .skip(sourceSkip)
                .limit(sourceLimit)
                .sort({ view_count: -1, createdAt: -1 })
                .lean();

            return raw.map(p => {
                if (p.artisan) {
                    const profilePicture = p.artisan.profile_picture
                        || p.artisan.profile?.profile_picture
                        || p.artisan.profile?.profile_image_url;
                    if (profilePicture && !p.artisan.profile_image_url) {
                        p.artisan.profile_image_url = profilePicture;
                    }

                    if (p.artisan.profile) {
                        p.artisan.location_city = p.artisan.profile.location_city;
                        p.artisan.craft_specialization = p.artisan.profile.craft_specialization;
                        delete p.artisan.profile;
                    }
                }
                return { ...p, feed_type: 'post' };
            });
        };

        const fetchProducts = async (sourceSkip = skip, sourceLimit = lim) => {
            const raw = await Product.find({ availability: true })
                .populate('artisan', 'name profile_picture')
                .skip(sourceSkip)
                .limit(sourceLimit)
                .sort({ createdAt: -1 })
                .lean();
            return raw.map(p => ({ ...p, feed_type: 'product' }));
        };

        const fetchRawMaterials = async (sourceSkip = skip, sourceLimit = lim) => {
            const raw = await RawMaterial.find({ availability: true })
                .populate('seller', 'name profile_picture')
                .skip(sourceSkip)
                .limit(sourceLimit)
                .sort({ createdAt: -1 })
                .lean();
            return raw.map(m => {
                const seller = m.seller || null;
                return { ...m, seller, posted_by_role: 'trader', feed_type: 'raw_material' };
            });
        };

        let items = [];
        let total = 0;

        if (type === 'posts') {
            const [fetched, count] = await Promise.all([
                fetchPosts(skip, lim),
                Post.countDocuments({}),
            ]);
            items = fetched;
            total = count;
        } else if (type === 'products') {
            const [fetched, count] = await Promise.all([
                fetchProducts(skip, lim),
                Product.countDocuments({ availability: true }),
            ]);
            items = fetched;
            total = count;
        } else if (type === 'rawmaterials') {
            const [fetched, count] = await Promise.all([
                fetchRawMaterials(skip, lim),
                RawMaterial.countDocuments({ availability: true }),
            ]);
            items = fetched;
            total = count;
        } else {
            // 'all' — distribute requested limit across sources, then interleave and cap to limit.
            const sourceCount = 3;
            const baseLimit = Math.floor(lim / sourceCount);
            let remainder = lim % sourceCount;

            const postLimit = baseLimit + (remainder > 0 ? 1 : 0);
            remainder = Math.max(0, remainder - 1);
            const productLimit = baseLimit + (remainder > 0 ? 1 : 0);
            remainder = Math.max(0, remainder - 1);
            const rawMaterialLimit = baseLimit + (remainder > 0 ? 1 : 0);

            const postSkip = (pageNum - 1) * postLimit;
            const productSkip = (pageNum - 1) * productLimit;
            const rawMaterialSkip = (pageNum - 1) * rawMaterialLimit;

            const [posts, products, rawMaterials, postCount, productCount, rawMaterialCount] = await Promise.all([
                fetchPosts(postSkip, postLimit),
                fetchProducts(productSkip, productLimit),
                fetchRawMaterials(rawMaterialSkip, rawMaterialLimit),
                Post.countDocuments({}),
                Product.countDocuments({ availability: true }),
                RawMaterial.countDocuments({ availability: true }),
            ]);

            // Round-robin interleave
            const maxLen = Math.max(posts.length, products.length, rawMaterials.length);
            for (let i = 0; i < maxLen; i++) {
                if (i < posts.length) items.push(posts[i]);
                if (i < products.length) items.push(products[i]);
                if (i < rawMaterials.length) items.push(rawMaterials[i]);
            }

            items = items.slice(0, lim);
            total = postCount + productCount + rawMaterialCount;
        }

        res.status(200).json({
            success: true,
            data: {
                items,
                type,
                pagination: {
                    page: pageNum,
                    limit: lim,
                    total,
                    pages: Math.ceil(total / lim),
                },
            },
        });
    } catch (error) {
        console.error('Unified feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unified feed.',
            error: error.message,
        });
    }
};
