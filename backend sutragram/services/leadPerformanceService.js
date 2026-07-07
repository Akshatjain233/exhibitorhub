import QuoteRequest from '../models/QuoteRequest.js';
import LeadAccess from '../models/LeadAccess.js';
import SupplierProfile from '../models/SupplierProfile.js';
import TraderProfile from '../models/TraderProfile.js';

const percent = (num, den) => (den > 0 ? Number(((num / den) * 100).toFixed(2)) : 0);

export const trackQuoteSentFromLead = async ({ supplierId, leadId }) => {
    if (!supplierId || !leadId) return;

    await LeadAccess.updateMany(
        { trader: supplierId, artisan: leadId },
        { $set: { interaction_type: 'quote_sent' } }
    );

    const profile = await SupplierProfile.findOne({ user: supplierId });
    if (!profile) return;

    const current = profile.lead_performance_metrics || {};
    const quotesSent = Number(current.total_quotes_sent || 0) + 1;
    const quotesAccepted = Number(current.total_quotes_accepted || 0);

    profile.lead_performance_metrics = {
        ...current,
        total_quotes_sent: quotesSent,
        quote_acceptance_rate: percent(quotesAccepted, quotesSent),
    };

    await profile.save();
};

export const trackQuoteAccepted = async ({ quote }) => {
    if (!quote) return;

    const requester = quote.requester?.toString?.() || quote.requester;
    const recipient = quote.recipient?.toString?.() || quote.recipient;

    if (quote.requester_type === 'supplier') {
        const profile = await SupplierProfile.findOne({ user: requester });
        if (profile) {
            const current = profile.lead_performance_metrics || {};
            const quotesSent = Number(current.total_quotes_sent || 0);
            const quotesAccepted = Number(current.total_quotes_accepted || 0) + 1;

            profile.lead_performance_metrics = {
                ...current,
                total_quotes_accepted: quotesAccepted,
                quote_acceptance_rate: percent(quotesAccepted, quotesSent),
            };
            await profile.save();
        }
    }

    if (quote.requester_type === 'trader') {
        const traderProfile = await TraderProfile.findOne({ user: requester });
        if (traderProfile) {
            const existing = traderProfile.leadConversionMetrics || {};
            const accepted = Number(existing.quotes_accepted || 0) + 1;
            const sent = Number(existing.quotes_sent || 0);
            traderProfile.leadConversionMetrics = {
                ...existing,
                quotes_accepted: accepted,
                conversion_rate: percent(accepted, sent),
            };
            await traderProfile.save();
        }
    }

    if (quote.item?.lead_id || quote.item?.item_type === 'lead') {
        const leadId = quote.item?.lead_id || quote.item?.item_id;
        await LeadAccess.updateMany(
            { trader: requester, artisan: leadId },
            { $set: { interaction_type: 'contact_requested' } }
        );
    }

    return { requester, recipient };
};

export const getSupplierLeadPerformanceAnalytics = async (supplierId) => {
    const [profile, leadAccessStats, quoteStats, topLeads] = await Promise.all([
        SupplierProfile.findOne({ user: supplierId }),
        LeadAccess.aggregate([
            { $match: { trader: supplierId } },
            {
                $group: {
                    _id: '$interaction_type',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$relevance_score' },
                },
            },
        ]),
        QuoteRequest.aggregate([
            { $match: { requester: supplierId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]),
        QuoteRequest.aggregate([
            { $match: { requester: supplierId, 'item.item_type': 'lead' } },
            {
                $group: {
                    _id: '$item.item_id',
                    totalQuotes: { $sum: 1 },
                    acceptedQuotes: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0],
                        },
                    },
                },
            },
            {
                $addFields: {
                    conversionRate: {
                        $cond: [
                            { $gt: ['$totalQuotes', 0] },
                            { $multiply: [{ $divide: ['$acceptedQuotes', '$totalQuotes'] }, 100] },
                            0,
                        ],
                    },
                },
            },
            { $sort: { conversionRate: -1, totalQuotes: -1 } },
            { $limit: 5 },
        ]),
    ]);

    const byInteraction = leadAccessStats.reduce((acc, row) => {
        acc[row._id] = row;
        return acc;
    }, {});

    const byQuoteStatus = quoteStats.reduce((acc, row) => {
        acc[row._id] = row.count;
        return acc;
    }, {});

    const quotesSent = Number(profile?.lead_performance_metrics?.total_quotes_sent || 0);
    const quotesAccepted = Number(profile?.lead_performance_metrics?.total_quotes_accepted || 0);

    return {
        creditEfficiency: {
            creditsSpent: Number(profile?.leads_accessed_this_month || 0),
            quotesAccepted,
            efficiency: percent(quotesAccepted, Number(profile?.leads_accessed_this_month || 0)),
        },
        funnel: {
            viewed: Number(byInteraction.view?.count || 0),
            quote_sent: Number(byInteraction.quote_sent?.count || 0),
            contact_requested: Number(byInteraction.contact_requested?.count || 0),
            quote_accepted: quotesAccepted,
        },
        quoteMetrics: {
            totalSent: quotesSent,
            accepted: quotesAccepted,
            pending: Number(byQuoteStatus.pending || 0),
            rejected: Number(byQuoteStatus.rejected || 0),
            acceptanceRate: percent(quotesAccepted, quotesSent),
        },
        topLeads,
    };
};

export default {
    trackQuoteSentFromLead,
    trackQuoteAccepted,
    getSupplierLeadPerformanceAnalytics,
};
