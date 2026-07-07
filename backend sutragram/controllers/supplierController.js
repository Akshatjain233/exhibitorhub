import SupplierProfile from '../models/SupplierProfile.js';
import LeadAccess from '../models/LeadAccess.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import CraftTag from '../models/CraftTag.js';
import {
    buildLeadQualityFlags,
    computeLeadScore,
    upsertLeadQualitySnapshot,
} from '../services/leadScoringService.js';
import { maybeSendLowCreditAlert, recordCreditTransaction } from '../services/creditService.js';
import { getSupplierLeadPerformanceAnalytics } from '../services/leadPerformanceService.js';

const toInt = (value, fallback) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const escapeRegex = (input = '') => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isTrue = (value, defaultValue = false) => {
    if (value === undefined || value === null || value === '') return defaultValue;
    const normalized = String(value).toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
};

// @desc    Get supplier profile
// @route   GET /api/v1/b2b/supplier/profile
// @access  Private (supplier only)
export const getSupplierProfile = async (req, res) => {
    try {
        const profile = await SupplierProfile.findOne({ user: req.user._id })
            .populate('user', 'name email phone_number');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Supplier profile not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: { profile },
        });
    } catch (error) {
        console.error('Get supplier profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch supplier profile.',
            error: error.message,
        });
    }
};

// @desc    Update supplier profile
// @route   PUT /api/v1/b2b/supplier/profile
// @access  Private (supplier only)
export const updateSupplierProfile = async (req, res) => {
    try {
        const {
            business_name,
            gst_number,
            business_type,
            material_types,
            operating_regions,
            contact_person_name,
            contact_designation,
            business_address,
            email_on_new_leads,
            sms_on_new_leads,
        } = req.body;

        const updateData = {};
        if (business_name) updateData.business_name = business_name;
        if (gst_number) updateData.gst_number = gst_number;
        if (business_type) updateData.business_type = business_type;
        if (Array.isArray(material_types)) updateData.material_types = material_types;
        if (Array.isArray(operating_regions)) updateData.operating_regions = operating_regions;
        if (contact_person_name) updateData.contact_person_name = contact_person_name;
        if (contact_designation) updateData.contact_designation = contact_designation;
        if (business_address) updateData.business_address = business_address;
        if (typeof email_on_new_leads === 'boolean') updateData.email_on_new_leads = email_on_new_leads;
        if (typeof sms_on_new_leads === 'boolean') updateData.sms_on_new_leads = sms_on_new_leads;

        const profile = await SupplierProfile.findOneAndUpdate(
            { user: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Supplier profile not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Supplier profile updated successfully.',
            data: { profile },
        });
    } catch (error) {
        console.error('Update supplier profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update supplier profile.',
            error: error.message,
        });
    }
};

// @desc    Get artisan leads (for suppliers)
// @route   GET /api/v1/b2b/supplier/leads
// @access  Private (supplier only)
export const getArtisanLeads = async (req, res) => {
    try {
        const {
            craft_type,
            region,
            page = 1,
            limit = 20,
            freshness_threshold = 60,
            include_stale,
        } = req.query;
        const parsedPage = Math.max(1, toInt(page, 1));
        const parsedLimit = Math.min(50, Math.max(1, toInt(limit, 20)));
        const parsedFreshnessThreshold = Math.max(1, toInt(freshness_threshold, 60));
        const shouldIncludeStale = isTrue(include_stale, true);
        const skip = (parsedPage - 1) * parsedLimit;

        const supplierProfile = await SupplierProfile.findOne({ user: req.user._id });
        if (!supplierProfile) {
            return res.status(404).json({
                success: false,
                message: 'Supplier profile not found.',
            });
        }

        if (!supplierProfile.is_premium && supplierProfile.lead_credits_balance <= 0) {
            return res.status(403).json({
                success: false,
                message: 'No lead credits remaining. Purchase credits or upgrade to premium.',
                data: {
                    credits_used: supplierProfile.leads_accessed_this_month,
                    credits_limit: supplierProfile.leads_monthly_limit,
                    credits_remaining: supplierProfile.lead_credits_balance,
                },
            });
        }

        const query = {};
        if (craft_type) {
            const normalizedCraftType = String(craft_type).trim();
            const matchingTags = await CraftTag.find({
                name_english: { $regex: new RegExp(`^${escapeRegex(normalizedCraftType)}$`, 'i') },
            }).select('_id');

            if (!matchingTags.length) {
                return res.status(200).json({
                    success: true,
                    data: {
                        leads: [],
                        lockedCount: 0,
                        creditsRemaining: supplierProfile.lead_credits_balance,
                        isPremium: supplierProfile.is_premium,
                        freshnessThreshold: parsedFreshnessThreshold,
                        pagination: {
                            page: parsedPage,
                            limit: parsedLimit,
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
        if (!shouldIncludeStale) {
            query.is_stale = { $ne: true };
        }

        const artisans = await ArtisanProfile.find(query)
            .populate('user', 'name email phone_number')
            .populate('craft_tags', 'name_english')
            .skip(skip)
            .limit(parsedLimit)
            .sort({ total_views: -1, rating_avg: -1 });

        const validArtisans = artisans
            .filter((artisan) => artisan.user != null)
            .map((artisan) => {
                const score = computeLeadScore({ artisan, supplierProfile });
                const quality_flags = buildLeadQualityFlags({
                    artisan,
                    daysSinceUpdate: score.daysSinceUpdate,
                });
                const staleForThreshold = score.daysSinceUpdate != null && score.daysSinceUpdate > parsedFreshnessThreshold;

                upsertLeadQualitySnapshot({
                    artisan,
                    supplierId: req.user._id,
                    score,
                }).catch((error) => {
                    console.error('Lead quality snapshot error:', error.message);
                });

                return {
                    ...artisan.toObject(),
                    match_score: score.finalScore,
                    score_breakdown: score.breakdown,
                    quality_tier: score.qualityTier,
                    freshness_days: score.daysSinceUpdate,
                    quality_flags,
                    is_stale_for_threshold: staleForThreshold,
                    stale_warning: staleForThreshold
                        ? `Lead is older than ${parsedFreshnessThreshold} days.`
                        : null,
                };
            })
            .sort((a, b) => {
                if ((a.is_stale ? 1 : 0) !== (b.is_stale ? 1 : 0)) {
                    return (a.is_stale ? 1 : 0) - (b.is_stale ? 1 : 0);
                }
                if (b.match_score !== a.match_score) return b.match_score - a.match_score;

                const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                if (bUpdated !== aUpdated) return bUpdated - aUpdated;

                return Number(b.total_views || 0) - Number(a.total_views || 0);
            });

        const total = await ArtisanProfile.countDocuments(query);

        if (!supplierProfile.is_premium) {
            const visibleCount = Math.min(validArtisans.length, supplierProfile.lead_credits_balance);
            const visibleLeads = validArtisans.map((artisan, idx) => {
                if (idx < visibleCount) {
                    return artisan;
                }

                return {
                    ...artisan,
                    user: artisan.user ? {
                        name: artisan.user.name || 'Unknown',
                        email: '***@***.com',
                        phone_number: '***-***-****',
                    } : null,
                };
            });

            return res.status(200).json({
                success: true,
                data: {
                    leads: visibleLeads,
                    lockedCount: Math.max(0, validArtisans.length - visibleCount),
                    creditsRemaining: supplierProfile.lead_credits_balance,
                    isPremium: false,
                    message: 'Lead details are limited by your current credit balance.',
                    freshnessThreshold: parsedFreshnessThreshold,
                    pagination: {
                        page: parsedPage,
                        limit: parsedLimit,
                        total,
                        pages: Math.ceil(total / parsedLimit),
                    },
                },
            });
        }

        res.status(200).json({
            success: true,
            data: {
                leads: validArtisans,
                creditsRemaining: supplierProfile.lead_credits_balance,
                isPremium: true,
                freshnessThreshold: parsedFreshnessThreshold,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    pages: Math.ceil(total / parsedLimit),
                },
            },
        });
    } catch (error) {
        console.error('Get artisan leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch artisan leads.',
            error: error.message,
        });
    }
};

// @desc    Upgrade supplier to premium
// @route   POST /api/v1/b2b/supplier/upgrade-premium
// @access  Private (supplier only)
export const upgradeToPremium = async (req, res) => {
    try {
        const premiumStart = new Date();
        const premiumEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        const profile = await SupplierProfile.findOneAndUpdate(
            { user: req.user._id },
            {
                is_premium: true,
                premium_start_date: premiumStart,
                premium_end_date: premiumEnd,
                leads_monthly_limit: 999,
                lead_credits_balance: 999,
            },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Supplier profile not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Upgraded to premium successfully.',
            data: { profile },
        });
    } catch (error) {
        console.error('Upgrade to premium error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upgrade to premium.',
            error: error.message,
        });
    }
};

// @desc    Track lead access (credit deduction)
// @route   POST /api/v1/b2b/supplier/leads/:artisan_id/track
// @access  Private (supplier only)
export const trackLeadAccess = async (req, res) => {
    try {
        const { artisan_id } = req.params;

        const supplierProfile = await SupplierProfile.findOne({ user: req.user._id });
        if (!supplierProfile) {
            return res.status(404).json({
                success: false,
                message: 'Supplier profile not found.',
            });
        }

        const existingAccess = await LeadAccess.findOne({
            trader: req.user._id,
            artisan: artisan_id,
        });

        if (existingAccess) {
            return res.status(200).json({
                success: true,
                message: 'Lead already tracked for this supplier.',
                data: {
                    leadAccess: existingAccess,
                    creditsRemaining: supplierProfile.lead_credits_balance,
                },
            });
        }

        if (!supplierProfile.is_premium) {
            if (supplierProfile.lead_credits_balance <= 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No lead credits remaining.',
                });
            }

            await SupplierProfile.updateOne(
                { user: req.user._id },
                {
                    $inc: {
                        lead_credits_balance: -1,
                        leads_accessed_this_month: 1,
                        total_leads_accessed: 1,
                    },
                }
            );

            await recordCreditTransaction(
                req.user._id,
                -1,
                'unlock',
                {
                    lead_id: artisan_id,
                    source: 'supplier_lead_unlock',
                },
                {
                    balanceAfter: supplierProfile.lead_credits_balance - 1,
                }
            );
        } else {
            await SupplierProfile.updateOne(
                { user: req.user._id },
                { $inc: { total_leads_accessed: 1 } }
            );
        }

        const artisan = await ArtisanProfile.findOne({ user: artisan_id });
        const relevanceScore = artisan
            ? computeLeadScore({ artisan, supplierProfile }).finalScore
            : 50;

        const leadAccess = await LeadAccess.create({
            trader: req.user._id,
            artisan: artisan_id,
            relevance_score: relevanceScore,
            unlocked_from: supplierProfile.is_premium ? 'premium' : 'paid',
            interaction_type: 'view',
        });

        const refreshedSupplier = await SupplierProfile.findOne({ user: req.user._id });
        await maybeSendLowCreditAlert(refreshedSupplier);

        res.status(201).json({
            success: true,
            message: 'Lead access tracked successfully.',
            data: {
                leadAccess,
                creditsRemaining: refreshedSupplier?.lead_credits_balance ?? 0,
            },
        });
    } catch (error) {
        console.error('Track lead access error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track lead access.',
            error: error.message,
        });
    }
};

// @desc    Get supplier analytics
// @route   GET /api/v1/b2b/supplier/analytics
// @access  Private (supplier only)
export const getSupplierAnalytics = async (req, res) => {
    try {
        const profile = await SupplierProfile.findOne({ user: req.user._id });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Supplier profile not found.',
            });
        }

        const avgLeadScoreData = await LeadAccess.aggregate([
            { $match: { trader: req.user._id } },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$relevance_score' },
                },
            },
        ]);

        const analytics = {
            leadsAccessedThisMonth: profile.leads_accessed_this_month,
            leadsAccessedTotal: profile.total_leads_accessed,
            creditsRemaining: profile.lead_credits_balance,
            materialsListed: profile.total_materials_listed || 0,
            isPremium: profile.is_premium,
            conversionRate: profile.conversion_rate || 0,
            averageLeadQualityScore: Number(avgLeadScoreData?.[0]?.avgScore || 0).toFixed(2),
            quoteAcceptanceRate: Number(profile.lead_performance_metrics?.quote_acceptance_rate || 0),
            averageQuoteResponseTimeHours: Number(profile.lead_performance_metrics?.avg_quote_response_time_hours || 0),
        };

        res.status(200).json({
            success: true,
            data: { analytics },
        });
    } catch (error) {
        console.error('Get supplier analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch supplier analytics.',
            error: error.message,
        });
    }
};

// @desc    Get supplier credit transaction history
// @route   GET /api/v1/b2b/supplier/credits/history
// @access  Private (supplier only)
export const getCreditTransactionHistory = async (req, res) => {
    try {
        const { action, from_date, to_date, limit = 50 } = req.query;
        const parsedLimit = Math.min(100, Math.max(1, toInt(limit, 50)));

        const profile = await SupplierProfile.findOne({ user: req.user._id });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Supplier profile not found.',
            });
        }

        let transactions = Array.isArray(profile.creditTransactions)
            ? [...profile.creditTransactions]
            : [];

        if (action) {
            transactions = transactions.filter((tx) => tx.action === action);
        }
        if (from_date) {
            const fromDate = new Date(from_date);
            if (!Number.isNaN(fromDate.getTime())) {
                transactions = transactions.filter((tx) => new Date(tx.date) >= fromDate);
            }
        }
        if (to_date) {
            const toDate = new Date(to_date);
            if (!Number.isNaN(toDate.getTime())) {
                transactions = transactions.filter((tx) => new Date(tx.date) <= toDate);
            }
        }

        transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        transactions = transactions.slice(0, parsedLimit);

        return res.status(200).json({
            success: true,
            data: {
                creditsRemaining: profile.lead_credits_balance,
                monthlyLimit: profile.leads_monthly_limit,
                transactions,
            },
        });
    } catch (error) {
        console.error('Get credit transaction history error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch credit transaction history.',
            error: error.message,
        });
    }
};

// @desc    Get supplier lead performance analytics
// @route   GET /api/v1/b2b/supplier/analytics/performance
// @access  Private (supplier only)
export const getSupplierPerformanceAnalytics = async (req, res) => {
    try {
        const profile = await SupplierProfile.findOne({ user: req.user._id });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Supplier profile not found.',
            });
        }

        const performance = await getSupplierLeadPerformanceAnalytics(req.user._id);

        return res.status(200).json({
            success: true,
            data: {
                performance,
            },
        });
    } catch (error) {
        console.error('Get supplier performance analytics error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch supplier performance analytics.',
            error: error.message,
        });
    }
};

export default {
    getSupplierProfile,
    updateSupplierProfile,
    getArtisanLeads,
    upgradeToPremium,
    trackLeadAccess,
    getSupplierAnalytics,
    getCreditTransactionHistory,
    getSupplierPerformanceAnalytics,
};
