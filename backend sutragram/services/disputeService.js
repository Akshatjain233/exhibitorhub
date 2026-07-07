import Dispute from '../models/Dispute.js';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';

/**
 * Dispute resolution service
 */

/**
 * Process a refund for a dispute
 */
export const processRefund = async (disputeId, refundAmount, resolution) => {
    try {
        const dispute = await Dispute.findById(disputeId).populate('order');

        if (!dispute) {
            throw new Error('Dispute not found');
        }

        if (!dispute.order) {
            throw new Error('Associated order not found');
        }

        // Get recipient (consumer who raised dispute)
        const recipient = dispute.raised_by;

        // Get sender (artisan or seller from order)
        let sender = dispute.order.artisan;
        if (!sender && dispute.order.seller) {
            sender = dispute.order.seller;
        }

        // Create refund transaction
        const refundTransaction = await Transaction.create({
            user: sender,
            related_user: recipient,
            amount: refundAmount,
            type: 'Refund',
            order: dispute.order._id,
            description: `Refund for dispute: ${resolution}`,
            status: 'pending',
        });

        // Update dispute with refund info
        dispute.refund = {
            amount: refundAmount,
            status: 'initiated',
            transaction_id: refundTransaction._id.toString(),
            processed_at: new Date(),
        };

        await dispute.save();

        return refundTransaction;
    } catch (error) {
        console.error('Error processing refund:', error);
        throw error;
    }
};

/**
 * Mark dispute as under review
 */
export const markUnderReview = async (disputeId, adminId, notes) => {
    try {
        const dispute = await Dispute.findById(disputeId);

        if (!dispute) {
            throw new Error('Dispute not found');
        }

        dispute.status = 'under_review';
        dispute.under_review_at = new Date();
        dispute.first_response_at = dispute.first_response_at || new Date();
        dispute.admin_notes = notes || dispute.admin_notes;
        dispute.last_updated_by = adminId;
        dispute.last_updated_at = new Date();

        await dispute.save();
        return dispute;
    } catch (error) {
        console.error('Error marking dispute under review:', error);
        throw error;
    }
};

/**
 * Approve dispute resolution
 */
export const approveDispute = async (disputeId, adminId, resolution, refundAmount, notes) => {
    try {
        const dispute = await Dispute.findById(disputeId).populate('order');

        if (!dispute) {
            throw new Error('Dispute not found');
        }

        // Process refund if applicable
        if (resolution === 'full_refund' || resolution === 'partial_refund') {
            const amount = refundAmount || (
                resolution === 'full_refund' ? dispute.order.total_amount : dispute.order.total_amount * 0.5
            );
            await processRefund(disputeId, amount, resolution);
        }

        dispute.status = 'resolved';
        dispute.resolution = resolution;
        dispute.resolution_notes = notes;
        dispute.resolved_at = new Date();
        dispute.resolved_by = adminId;
        dispute.last_updated_by = adminId;
        dispute.last_updated_at = new Date();

        await dispute.save();
        return dispute;
    } catch (error) {
        console.error('Error approving dispute:', error);
        throw error;
    }
};

/**
 * Reject dispute
 */
export const rejectDispute = async (disputeId, adminId, reason) => {
    try {
        const dispute = await Dispute.findById(disputeId);

        if (!dispute) {
            throw new Error('Dispute not found');
        }

        dispute.status = 'rejected';
        dispute.resolution = 'no_action';
        dispute.resolution_notes = reason;
        dispute.resolved_at = new Date();
        dispute.resolved_by = adminId;
        dispute.last_updated_by = adminId;
        dispute.last_updated_at = new Date();

        await dispute.save();
        return dispute;
    } catch (error) {
        console.error('Error rejecting dispute:', error);
        throw error;
    }
};

/**
 * Add consumer response to escalated dispute
 */
export const addConsumerResponse = async (disputeId, response) => {
    try {
        const dispute = await Dispute.findById(disputeId);

        if (!dispute) {
            throw new Error('Dispute not found');
        }

        dispute.consumer_response = response;
        dispute.last_updated_at = new Date();

        await dispute.save();
        return dispute;
    } catch (error) {
        console.error('Error adding consumer response:', error);
        throw error;
    }
};

/**
 * Add seller response to escalated dispute
 */
export const addSellerResponse = async (disputeId, response) => {
    try {
        const dispute = await Dispute.findById(disputeId);

        if (!dispute) {
            throw new Error('Dispute not found');
        }

        dispute.seller_response = response;
        dispute.last_updated_at = new Date();

        await dispute.save();
        return dispute;
    } catch (error) {
        console.error('Error adding seller response:', error);
        throw error;
    }
};

/**
 * Get dispute stats for dashboard
 */
export const getDisputeStats = async () => {
    try {
        const stats = await Dispute.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const result = {
            open: 0,
            under_review: 0,
            resolved: 0,
            rejected: 0,
            closed: 0,
        };

        stats.forEach(stat => {
            result[stat._id] = stat.count;
        });

        // Get average resolution time
        const resolvedDisputes = await Dispute.find({ status: 'resolved' })
            .select('createdAt resolved_at');

        const avgTime = resolvedDisputes.length > 0
            ? resolvedDisputes.reduce((sum, d) => sum + (d.resolved_at - d.createdAt), 0) / resolvedDisputes.length
            : 0;

        result.avg_resolution_hours = Math.round(avgTime / (1000 * 60 * 60));

        return result;
    } catch (error) {
        console.error('Error getting dispute stats:', error);
        throw error;
    }
};

export default {
    processRefund,
    markUnderReview,
    approveDispute,
    rejectDispute,
    addConsumerResponse,
    addSellerResponse,
    getDisputeStats,
};
