import Advertisement from '../models/Advertisement.js';

/**
 * Ad serving logic - selects and serves relevant ads based on targeting
 */

/**
 * Get active advertisements for a specific placement and user context
 */
export const getActiveAds = async (placement, userContext = {}) => {
    try {
        const now = new Date();

        // Build query for active ads
        const query = {
            status: 'active',
            'schedule.start_date': { $lte: now },
            'schedule.end_date': { $gte: now },
            placement: placement,
        };

        // Get all active ads for this placement
        const ads = await Advertisement.find(query)
            .select('_id title description media call_to_action budget metrics targeting')
            .lean();

        if (ads.length === 0) return null;

        // Filter by targeting if user context provided
        let filteredAds = ads;
        if (userContext.role && ads[0].targeting) {
            filteredAds = ads.filter(ad => {
                if (!ad.targeting || !ad.targeting.user_roles) return true;
                if (ad.targeting.user_roles.includes('all')) return true;
                return ad.targeting.user_roles.includes(userContext.role);
            });
        }

        if (filteredAds.length === 0) return null;

        // Select random ad (weighted by performance later)
        const selectedAd = filteredAds[Math.floor(Math.random() * filteredAds.length)];

        // Check budget
        if (selectedAd.budget.spent >= selectedAd.budget.total) {
            return null;
        }

        return selectedAd;
    } catch (error) {
        console.error('Error getting active ads:', error);
        return null;
    }
};

/**
 * Record an impression for an ad
 */
export const recordImpression = async (adId) => {
    try {
        const ad = await Advertisement.findByIdAndUpdate(
            adId,
            {
                $inc: {
                    'metrics.impressions': 1,
                    'budget.spent': (await Advertisement.findById(adId)).budget.cost_per_impression,
                },
            },
            { new: true }
        );

        // Auto-complete if budget exhausted
        if (ad.budget.spent >= ad.budget.total) {
            await Advertisement.findByIdAndUpdate(adId, { status: 'completed' });
        }

        return ad;
    } catch (error) {
        console.error('Error recording impression:', error);
        return null;
    }
};

/**
 * Record a click for an ad
 */
export const recordClick = async (adId) => {
    try {
        const ad = await Advertisement.findByIdAndUpdate(
            adId,
            {
                $inc: {
                    'metrics.clicks': 1,
                    'budget.spent': (await Advertisement.findById(adId)).budget.cost_per_click,
                },
            },
            { new: true }
        );

        // Auto-complete if budget exhausted
        if (ad.budget.spent >= ad.budget.total) {
            await Advertisement.findByIdAndUpdate(adId, { status: 'completed' });
        }

        return ad;
    } catch (error) {
        console.error('Error recording click:', error);
        return null;
    }
};

/**
 * Get personalized ads for user
 */
export const getPersonalizedAds = async (userId, placement, limit = 5) => {
    try {
        // Get user role for targeting
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(userId).select('role');

        if (!user) return [];

        const now = new Date();

        // Query for active, targeted ads
        const ads = await Advertisement.find({
            status: 'active',
            'schedule.start_date': { $lte: now },
            'schedule.end_date': { $gte: now },
            placement: placement,
            $or: [
                { 'targeting.user_roles': 'all' },
                { 'targeting.user_roles': user.role },
            ],
        })
            .select('_id title description media call_to_action metrics')
            .limit(limit);

        return ads;
    } catch (error) {
        console.error('Error getting personalized ads:', error);
        return [];
    }
};

/**
 * Get ad performance metrics
 */
export const getAdPerformance = async (adId) => {
    try {
        const ad = await Advertisement.findById(adId).select('metrics budget');

        if (!ad) return null;

        const ctr = ad.metrics.impressions > 0 
            ? (ad.metrics.clicks / ad.metrics.impressions) * 100 
            : 0;

        const cpc = ad.metrics.clicks > 0 
            ? ad.budget.spent / ad.metrics.clicks 
            : 0;

        return {
            impressions: ad.metrics.impressions,
            clicks: ad.metrics.clicks,
            conversions: ad.metrics.conversions,
            ctr: ctr.toFixed(2),
            cpc: cpc.toFixed(2),
            spent: ad.budget.spent,
            remaining: ad.budget.total - ad.budget.spent,
        };
    } catch (error) {
        console.error('Error getting ad performance:', error);
        return null;
    }
};

export default {
    getActiveAds,
    recordImpression,
    recordClick,
    getPersonalizedAds,
    getAdPerformance,
};
