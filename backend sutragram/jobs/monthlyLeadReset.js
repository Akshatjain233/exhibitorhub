import SupplierProfile from '../models/SupplierProfile.js';

// Reset monthly free credits for non-premium suppliers.
export const resetSupplierMonthlyLeadCredits = async () => {
    const profiles = await SupplierProfile.find({ is_premium: false }).select(
        '_id lead_credits_balance leads_monthly_limit leads_accessed_this_month creditTransactions'
    );

    if (!profiles.length) {
        return {
            matchedCount: 0,
            modifiedCount: 0,
        };
    }

    const ops = profiles.map((profile) => {
        const nextBalance = Number(profile.leads_monthly_limit || 0);
        const delta = nextBalance - Number(profile.lead_credits_balance || 0);

        const nextTransactions = [
            ...(profile.creditTransactions || []),
            {
                date: new Date(),
                credit_change: delta,
                balance_after: nextBalance,
                action: 'monthly_reset',
                metadata: {
                    previous_balance: Number(profile.lead_credits_balance || 0),
                },
            },
        ];

        return {
            updateOne: {
                filter: { _id: profile._id },
                update: {
                    $set: {
                        leads_accessed_this_month: 0,
                        lead_credits_balance: nextBalance,
                        creditTransactions: nextTransactions.slice(-2000),
                    },
                },
            },
        };
    });

    const result = await SupplierProfile.bulkWrite(ops);

    return {
        matchedCount: result.matchedCount || profiles.length,
        modifiedCount: result.modifiedCount || 0,
    };
};

export default {
    resetSupplierMonthlyLeadCredits,
};
