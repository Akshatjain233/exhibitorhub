import Advertisement from '../models/Advertisement.js';

// @desc    Create ad campaign
// @route   POST /api/advertisements
// @access  Private (admin only)
export const createCampaign = async (req, res) => {
    try {
        const {
            advertiser,
            campaign_name,
            title,
            description,
            media,
            media_url,
            targeting,
            budget,
            start_date,
            end_date,
            schedule,
            placement,
            status,
        } = req.body;

        const normalizedMedia = media || (media_url ? { url: media_url, type: 'image' } : null);
        const normalizedSchedule = schedule || (
            start_date && end_date
                ? { start_date, end_date }
                : null
        );

        if (!advertiser || !campaign_name || !title || !normalizedMedia?.url || !normalizedSchedule?.start_date || !normalizedSchedule?.end_date || !budget?.total) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided.',
            });
        }

        const ad = await Advertisement.create({
            advertiser,
            campaign_name,
            title,
            description: description || '',
            media: normalizedMedia,
            targeting: targeting || {},
            budget,
            schedule: normalizedSchedule,
            placement: placement || 'all',
            status: status || 'draft',
        });

        res.status(201).json({
            success: true,
            message: 'Ad campaign created successfully.',
            data: { ad },
        });
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create ad campaign.',
            error: error.message,
        });
    }
};

// @desc    Get ads for feed (to display)
// @route   GET /api/advertisements/serve
// @access  Public
export const serveAd = async (req, res) => {
    try {
        const { region, craft_category } = req.query;

        const now = new Date();
        const query = {
            status: 'active',
            'schedule.start_date': { $lte: now },
            'schedule.end_date': { $gte: now },
        };

        // Add targeting filters
        if (region) {
            query['targeting.regions'] = region;
        }
        if (craft_category) {
            query['targeting.craft_categories'] = craft_category;
        }

        // Get random ad
        const ads = await Advertisement.find(query);

        if (ads.length === 0) {
            return res.status(200).json({
                success: true,
                data: { ad: null },
            });
        }

        const randomAd = ads[Math.floor(Math.random() * ads.length)];

        // Increment impressions
        randomAd.metrics.impressions = (randomAd.metrics.impressions || 0) + 1;
        randomAd.metrics.ctr = randomAd.metrics.impressions > 0
            ? (randomAd.metrics.clicks || 0) / randomAd.metrics.impressions
            : 0;
        await randomAd.save();

        res.status(200).json({
            success: true,
            data: { ad: randomAd },
        });
    } catch (error) {
        console.error('Serve ad error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to serve ad.',
            error: error.message,
        });
    }
};

// @desc    Track ad click
// @route   POST /api/advertisements/:adId/click
// @access  Public
export const trackClick = async (req, res) => {
    try {
        const { id: adId, adId: fallbackAdId } = req.params;
        const resolvedId = adId || fallbackAdId;

        const ad = await Advertisement.findById(resolvedId);

        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found.',
            });
        }

        ad.metrics.clicks = (ad.metrics.clicks || 0) + 1;
        ad.metrics.ctr = ad.metrics.impressions > 0
            ? ad.metrics.clicks / ad.metrics.impressions
            : 0;
        ad.metrics.cpc = ad.metrics.clicks > 0
            ? (ad.budget?.spent || 0) / ad.metrics.clicks
            : 0;
        await ad.save();

        res.status(200).json({
            success: true,
            message: 'Click tracked successfully.',
        });
    } catch (error) {
        console.error('Track click error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track click.',
            error: error.message,
        });
    }
};

// @desc    Get ad campaign performance
// @route   GET /api/advertisements/:adId/performance
// @access  Private (admin only)
export const getCampaignPerformance = async (req, res) => {
    try {
        const { id: adId, adId: fallbackAdId } = req.params;
        const resolvedId = adId || fallbackAdId;

        const ad = await Advertisement.findById(resolvedId);

        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found.',
            });
        }

        const impressions = ad.metrics?.impressions || 0;
        const clicks = ad.metrics?.clicks || 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                impressions,
                clicks,
                ctr: ctr.toFixed(2) + '%',
                cpc: ad.metrics?.cpc || 0,
            },
        });
    } catch (error) {
        console.error('Get campaign performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign performance.',
            error: error.message,
        });
    }
};

// @desc    Update ad campaign
// @route   PUT /api/advertisements/:adId
// @access  Private (admin only)
export const updateCampaign = async (req, res) => {
    try {
        const { adId, id } = req.params;
        const resolvedId = adId || id;
        const updates = req.body;

        const ad = await Advertisement.findByIdAndUpdate(resolvedId, updates, { new: true });

        if (!ad) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Ad campaign updated successfully.',
            data: { ad },
        });
    } catch (error) {
        console.error('Update campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update ad campaign.',
            error: error.message,
        });
    }
};

// @desc    Get all campaigns
// @route   GET /api/advertisements
// @access  Private (admin only)
export const getAllCampaigns = async (req, res) => {
    try {
        const { is_active, status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (is_active !== undefined) {
            query.status = is_active === 'true' ? 'active' : { $ne: 'active' };
        }
        if (status) {
            query.status = status;
        }

        const ads = await Advertisement.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Advertisement.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                ads,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get all campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaigns.',
            error: error.message,
        });
    }
};
