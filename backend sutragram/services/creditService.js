import SupplierProfile from '../models/SupplierProfile.js';
import User from '../models/User.js';
import { sendEmail } from './emailService.js';

const ALERT_THRESHOLD = 0.2;

export const recordCreditTransaction = async (
    supplierId,
    creditChange,
    action,
    metadata = {},
    options = {}
) => {
    const profile = await SupplierProfile.findOne({ user: supplierId });
    if (!profile) return null;

    const balanceAfter = typeof options.balanceAfter === 'number'
        ? options.balanceAfter
        : Number(profile.lead_credits_balance || 0);

    profile.creditTransactions.push({
        date: new Date(),
        credit_change: Number(creditChange),
        balance_after: balanceAfter,
        action,
        lead_id: metadata.lead_id || null,
        metadata,
    });

    // Keep only latest 2000 transactions to avoid document bloat.
    if (profile.creditTransactions.length > 2000) {
        profile.creditTransactions = profile.creditTransactions.slice(-2000);
    }

    await profile.save();
    return profile;
};

export const maybeSendLowCreditAlert = async (supplierProfile) => {
    if (!supplierProfile || supplierProfile.is_premium) return;

    const monthlyLimit = Number(supplierProfile.leads_monthly_limit || 0);
    if (monthlyLimit <= 0) return;

    const creditsRemaining = Number(supplierProfile.lead_credits_balance || 0);
    const thresholdValue = Math.ceil(monthlyLimit * ALERT_THRESHOLD);

    if (creditsRemaining > thresholdValue) return;

    const alreadyNotified = supplierProfile.creditTransactions
        ?.slice(-20)
        ?.some((entry) => entry.action === 'bonus' && entry.metadata?.alert_type === 'low_credit_20_percent');

    if (alreadyNotified) return;

    const user = await User.findById(supplierProfile.user).select('email name');
    if (!user?.email) return;

    await sendEmail({
        to: user.email,
        subject: 'Low Lead Credits Alert',
        htmlContent: `<p>Hello ${user.name || 'Supplier'},</p>
            <p>Your lead credit balance is low.</p>
            <p>Credits remaining: <strong>${creditsRemaining}</strong> out of monthly limit <strong>${monthlyLimit}</strong>.</p>
            <p>Consider purchasing additional credits or upgrading to premium to avoid interruption.</p>`,
    });

    supplierProfile.creditTransactions.push({
        date: new Date(),
        credit_change: 0,
        balance_after: creditsRemaining,
        action: 'bonus',
        metadata: {
            alert_type: 'low_credit_20_percent',
            threshold_percent: 20,
        },
    });

    await supplierProfile.save();
};

export default {
    recordCreditTransaction,
    maybeSendLowCreditAlert,
};
