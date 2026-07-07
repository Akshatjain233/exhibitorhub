import LeadAccess from '../models/LeadAccess.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import TraderProfile from '../models/TraderProfile.js';
import CraftTag from '../models/CraftTag.js';
import { buildLeadQualityFlags, computeLeadScore } from '../services/leadScoringService.js';

const escapeRegex = (input = '') => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildPseudoSupplierFromTrader = (traderProfile) => ({
    operating_regions: traderProfile?.interested_regions || [],
});

// @desc    Generate leads for traders
// @route   GET /api/leads/generate
// @access  Private (trader only)
export const generateLeads = async (req, res) => {
    try {
        const { art_type, region, min_rating, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const traderProfile = await TraderProfile.findOne({ user: req.user._id });
        const pseudoSupplier = buildPseudoSupplierFromTrader(traderProfile);

        const query = {};
        if (art_type) {
            const normalizedArtType = String(art_type).trim();
            const matchingTags = await CraftTag.find({
                name_english: { $regex: new RegExp(`^${escapeRegex(normalizedArtType)}$`, 'i') },
            }).select('_id');

            if (!matchingTags.length) {
                return res.status(200).json({
                    success: true,
                    data: {
                        leads: [],
                        pagination: {
                            page: parseInt(page),
                            limit: parseInt(limit),
                            total: 0,
                            pages: 0,
                        },
                    },
                });
            }

            query.craft_tags = { $in: matchingTags.map((tag) => tag._id) };
        }
        if (region) {
            query.location_region = new RegExp(region, 'i');
        }
        if (min_rating) {
            query.rating_avg = { $gte: parseFloat(min_rating) };
        }

        const artisans = await ArtisanProfile.find(query)
            .populate('user', 'name')
            .populate('craft_tags', 'name_english')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ total_views: -1, rating_avg: -1 });

        const leads = artisans
            .map((artisan) => {
                const score = computeLeadScore({ artisan, supplierProfile: pseudoSupplier });
                return {
                    ...artisan.toObject(),
                    relevance_score: score.finalScore,
                    quality_tier: score.qualityTier,
                    freshness_days: score.daysSinceUpdate,
                    quality_flags: buildLeadQualityFlags({
                        artisan,
                        daysSinceUpdate: score.daysSinceUpdate,
                    }),
                };
            })
            .sort((a, b) => {
                if (b.relevance_score !== a.relevance_score) return b.relevance_score - a.relevance_score;

                const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                if (bUpdated !== aUpdated) return bUpdated - aUpdated;

                return Number(b.total_views || 0) - Number(a.total_views || 0);
            });

        const total = await ArtisanProfile.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                leads,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Generate leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate leads.',
            error: error.message,
        });
    }
};

// @desc    Track lead usage
// @route   POST /api/leads/track
// @access  Private (trader only)
export const trackLeadUsage = async (req, res) => {
    try {
        const { artisan_id } = req.body;

        if (!artisan_id) {
            return res.status(400).json({
                success: false,
                message: 'Artisan ID is required.',
            });
        }

        // Check if lead already accessed
        const existingAccess = await LeadAccess.findOne({
            trader: req.user._id,
            artisan: artisan_id,
        });

        if (existingAccess) {
            return res.status(200).json({
                success: true,
                message: 'Lead already tracked.',
                data: { leadAccess: existingAccess },
            });
        }

        // Calculate relevance score
        const artisan = await ArtisanProfile.findOne({ user: artisan_id });
        const relevanceScore = artisan
            ? computeLeadScore({ artisan, supplierProfile: buildPseudoSupplierFromTrader(null) }).finalScore
            : 50;

        const leadAccess = await LeadAccess.create({
            trader: req.user._id,
            artisan: artisan_id,
            relevance_score: relevanceScore,
            unlocked_from: 'free_limit',
            interaction_type: 'view',
        });

        res.status(201).json({
            success: true,
            message: 'Lead usage tracked successfully.',
            data: { leadAccess },
        });
    } catch (error) {
        console.error('Track lead usage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track lead usage.',
            error: error.message,
        });
    }
};

// @desc    Get tracked leads
// @route   GET /api/leads/tracked
// @access  Private (trader only)
export const getTrackedLeads = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const trackedLeads = await LeadAccess.find({ trader: req.user._id })
            .populate({
                path: 'artisan',
                select: 'name email phone_number',
            })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ unlocked_at: -1 });

        const total = await LeadAccess.countDocuments({ trader: req.user._id });

        res.status(200).json({
            success: true,
            data: {
                leads: trackedLeads,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get tracked leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tracked leads.',
            error: error.message,
        });
    }
};

// @desc    Filter leads by multiple criteria
// @route   POST /api/leads/filter
// @access  Private (trader only)
export const filterLeads = async (req, res) => {
    try {
        const { art_types, regions, min_rating, max_results = 20 } = req.body;
        const traderProfile = await TraderProfile.findOne({ user: req.user._id });
        const pseudoSupplier = buildPseudoSupplierFromTrader(traderProfile);

        const query = {};
        if (art_types && art_types.length > 0) {
            const normalized = art_types.map((value) => String(value || '').trim()).filter(Boolean);
            const matchingTags = await CraftTag.find({
                name_english: { $in: normalized.map((name) => new RegExp(`^${escapeRegex(name)}$`, 'i')) },
            }).select('_id');

            if (!matchingTags.length) {
                return res.status(200).json({
                    success: true,
                    data: { leads: [] },
                });
            }

            query.craft_tags = { $in: matchingTags.map((tag) => tag._id) };
        }
        if (regions && regions.length > 0) {
            query.location_region = { $in: regions };
        }
        if (min_rating) {
            query.rating_avg = { $gte: parseFloat(min_rating) };
        }

        const artisans = await ArtisanProfile.find(query)
            .populate('user', 'name')
            .populate('craft_tags', 'name_english')
            .limit(parseInt(max_results))
            .sort({ total_views: -1, rating_avg: -1 });

        const leads = artisans
            .map((artisan) => {
                const score = computeLeadScore({ artisan, supplierProfile: pseudoSupplier });
                return {
                    ...artisan.toObject(),
                    relevance_score: score.finalScore,
                    quality_tier: score.qualityTier,
                    freshness_days: score.daysSinceUpdate,
                    quality_flags: buildLeadQualityFlags({
                        artisan,
                        daysSinceUpdate: score.daysSinceUpdate,
                    }),
                };
            })
            .sort((a, b) => b.relevance_score - a.relevance_score);

        res.status(200).json({
            success: true,
            data: { leads },
        });
    } catch (error) {
        console.error('Filter leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to filter leads.',
            error: error.message,
        });
    }
};

// @desc    Get trader/B2B invoices
// @route   GET /api/b2b/invoices
// @access  Private (trader only)
export const getInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'all' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Mock invoice data - in production, this would come from Order model
        const query = { trader_id: req.user._id };
        if (status !== 'all') {
            query.status = status;
        }

        // Mock data for now
        const invoices = [
            {
                invoice_id: `INV-${req.user._id}-001`,
                artisan_name: 'Sample Artisan 1',
                products: ['Product 1', 'Product 2'],
                amount: 5000,
                status: 'pending',
                created_at: new Date(),
                due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            },
        ];

        const total = invoices.length;

        res.status(200).json({
            success: true,
            data: {
                invoices: invoices.slice(skip, skip + parseInt(limit)),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices.',
            error: error.message,
        });
    }
};
