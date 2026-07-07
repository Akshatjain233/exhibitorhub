import Post from '../models/Post.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import Product from '../models/Product.js';
import RawMaterial from '../models/RawMaterial.js';
import CraftTag from '../models/CraftTag.js';
import { getActiveAds, recordImpression } from '../services/adService.js';

// @desc    Universal search
// @route   GET /api/search
// @access  Public
export const search = async (req, res) => {
    try {
        const { query, type = 'all', page = 1, limit = 20 } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required.',
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const searchRegex = new RegExp(query, 'i');
        const results = {};

        if (type === 'all' || type === 'content') {
            const posts = await Post.find({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                ],
            })
                .populate('artisan', 'name')
                .populate('tags.tag', 'name_english')
                .limit(type === 'content' ? parseInt(limit) : 5)
                .skip(type === 'content' ? skip : 0);

            results.posts = posts;
        }

        if (type === 'all' || type === 'artisans') {
            // Find users whose names match the search query
            const matchingUsers = await (await import('../models/User.js')).default.find(
                { name: searchRegex, role: 'artisan' },
                { _id: 1 }
            );
            const matchingUserIds = matchingUsers.map(u => u._id);

            const artisans = await ArtisanProfile.find({
                $or: [
                    { user: { $in: matchingUserIds } },
                    { bio_text: searchRegex },
                    { craft_specialization: searchRegex },
                    { location_city: searchRegex },
                ],
            })
                .populate('user', 'name profile_image_url')
                .populate('craft_tags', 'name_english')
                .limit(type === 'artisans' ? parseInt(limit) : 5)
                .skip(type === 'artisans' ? skip : 0);

            results.artisans = artisans;
        }

        if (type === 'all' || type === 'products') {
            const products = await Product.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { category: searchRegex },
                ],
            })
                .populate('artisan', 'name')
                .limit(type === 'products' ? parseInt(limit) : 5)
                .skip(type === 'products' ? skip : 0);

            results.products = products;
        }

        if (type === 'all' || type === 'materials') {
            const materials = await RawMaterial.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { category: searchRegex },
                ],
            })
                .populate('seller', 'name business_name')
                .limit(type === 'materials' ? parseInt(limit) : 5)
                .skip(type === 'materials' ? skip : 0);

            results.materials = materials;
        }

        // Include ads in search results
        const ad = await getActiveAds('search', { role: req.user?.role || 'consumer' });
        if (ad) {
            recordImpression(ad._id).catch(err => console.log('Error recording impression:', err));
            results.advertisement = {
                _id: ad._id,
                title: ad.title,
                description: ad.description,
                media_url: ad.media.url,
                call_to_action: ad.call_to_action,
                sponsored: true,
            };
        }

        res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed.',
            error: error.message,
        });
    }
};

// @desc    Search craft tags
// @route   GET /api/search/crafts
// @access  Public
export const searchCrafts = async (req, res) => {
    try {
        const { query, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const searchRegex = new RegExp(query || '', 'i');

        const crafts = await CraftTag.find({
            $or: [
                { name_english: searchRegex },
                { name_vernacular: searchRegex },
                { type: searchRegex },
            ],
        })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CraftTag.countDocuments({
            $or: [
                { name_english: searchRegex },
                { name_vernacular: searchRegex },
            ],
        });

        res.status(200).json({
            success: true,
            data: {
                crafts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Search crafts error:', error);
        res.status(500).json({
            success: false,
            message: 'Craft search failed.',
            error: error.message,
        });
    }
};

// @desc    Search artisans by location
// @route   GET /api/search/artisans/location
// @access  Public
export const searchArtisansByLocation = async (req, res) => {
    try {
        const { city, state, region, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (city) query.location_city = new RegExp(city, 'i');
        if (state) query.location_state = new RegExp(state, 'i');
        if (region) query.location_region = new RegExp(region, 'i');

        const artisans = await ArtisanProfile.find(query)
            .populate('user', 'name')
            .populate('craft_tags', 'name_english')
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ArtisanProfile.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                artisans,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Search artisans by location error:', error);
        res.status(500).json({
            success: false,
            message: 'Location search failed.',
            error: error.message,
        });
    }
};
