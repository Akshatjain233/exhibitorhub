import LeadQuality from '../models/LeadQuality.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const toDays = (dateLike) => {
    if (!dateLike) return null;
    const t = new Date(dateLike).getTime();
    if (Number.isNaN(t)) return null;
    return Math.floor((Date.now() - t) / ONE_DAY_MS);
};

const toTier = (score) => {
    if (score >= 80) return 'high';
    if (score >= 45) return 'medium';
    return 'low';
};

export const computeLeadScore = ({ artisan, supplierProfile }) => {
    const rating = Number(artisan?.rating_avg || 0);
    const totalViews = Number(artisan?.total_views || 0);

    const ratingScore = rating * 25;
    const engagementScore = Math.min(40, totalViews / 50);

    let regionBonus = 0;
    if (supplierProfile?.operating_regions?.length && artisan?.location_region) {
        const match = supplierProfile.operating_regions.some((region) =>
            artisan.location_region.toLowerCase().includes(String(region).toLowerCase())
        );
        if (match) regionBonus = 20;
    }

    const daysSinceUpdate = toDays(artisan?.updatedAt);
    const freshnessScore = daysSinceUpdate == null ? 0 : Math.max(0, 15 - daysSinceUpdate);

    const daysSinceActive = toDays(artisan?.last_active_at || artisan?.updatedAt);
    const activityBonus = daysSinceActive != null && daysSinceActive <= 14 ? 10 : 0;

    const conversionRate = Number(artisan?.conversion_rate || 0);
    const conversionBonus = Math.max(0, conversionRate) * 5;

    const finalScore = Math.round(
        ratingScore +
        engagementScore +
        regionBonus +
        freshnessScore +
        activityBonus +
        conversionBonus
    );

    return {
        finalScore,
        breakdown: {
            rating: Number(ratingScore.toFixed(2)),
            engagement: Number(engagementScore.toFixed(2)),
            region_bonus: Number(regionBonus.toFixed(2)),
            freshness: Number(freshnessScore.toFixed(2)),
            activity: Number(activityBonus.toFixed(2)),
            conversion: Number(conversionBonus.toFixed(2)),
        },
        qualityTier: toTier(finalScore),
        daysSinceUpdate,
    };
};

export const buildLeadQualityFlags = ({ artisan, daysSinceUpdate }) => {
    const flags = [];

    if (Number(artisan?.rating_avg || 0) < 3.5) {
        flags.push('low_rating');
    }

    if (Number(artisan?.total_views || 0) === 0) {
        flags.push('low_visibility');
    }

    if (daysSinceUpdate != null && daysSinceUpdate > 60) {
        flags.push('stale_warning');
    }

    if (artisan?.is_stale) {
        flags.push('stale_lead');
    }

    return flags;
};

export const upsertLeadQualitySnapshot = async ({ artisan, supplierId, score }) => {
    if (!artisan?.user || !score) return null;

    return LeadQuality.create({
        lead_id: artisan.user,
        supplier_id: supplierId,
        score_breakdown: score.breakdown,
        final_score: score.finalScore,
        quality_tier: score.qualityTier,
        computed_at: new Date(),
    });
};

export default {
    computeLeadScore,
    buildLeadQualityFlags,
    upsertLeadQualitySnapshot,
};
