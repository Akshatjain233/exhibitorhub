import ArtisanProfile from '../models/ArtisanProfile.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const markStaleLeads = async (staleAfterDays = 180) => {
    const cutoffDate = new Date(Date.now() - (staleAfterDays * ONE_DAY_MS));

    const staleResult = await ArtisanProfile.updateMany(
        {
            updatedAt: { $lt: cutoffDate },
            is_stale: { $ne: true },
        },
        {
            $set: {
                is_stale: true,
                stale_marked_at: new Date(),
            },
        }
    );

    const freshResult = await ArtisanProfile.updateMany(
        {
            updatedAt: { $gte: cutoffDate },
            is_stale: true,
        },
        {
            $set: {
                is_stale: false,
            },
            $unset: {
                stale_marked_at: 1,
            },
        }
    );

    return {
        staleMarked: staleResult.modifiedCount || 0,
        restoredFresh: freshResult.modifiedCount || 0,
    };
};

export default {
    markStaleLeads,
};
