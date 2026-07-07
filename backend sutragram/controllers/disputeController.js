import Dispute from '../models/Dispute.js';
import Order from '../models/Order.js';
import { sendEmail, sendAdminNotification } from '../services/emailService.js';
import * as disputeService from '../services/disputeService.js';

// @desc    Create a dispute
// @route   POST /api/disputes
// @access  Private
export const createDispute = async (req, res) => {
    try {
        const { orderId, dispute_type, description, evidence_urls } = req.body;

        // Verify order exists and belongs to user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        if (order.consumer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to dispute this order.',
            });
        }

        // Create dispute
        const dispute = await Dispute.create({
            order: orderId,
            raised_by: req.user._id,
            dispute_type,
            description,
            evidence_urls: evidence_urls || [],
        });

        // Notify admin
        await sendAdminNotification({
            subject: 'New Dispute Raised',
            message: `A new dispute has been raised for order #${orderId}`,
            details: {
                disputeId: dispute._id,
                disputeType: dispute_type,
                orderId,
                raisedBy: req.user.email,
            },
        }).catch((err) => console.error('Failed to send admin notification:', err));

        res.status(201).json({
            success: true,
            message: 'Dispute created successfully. Our team will review it shortly.',
            data: { dispute },
        });
    } catch (error) {
        console.error('Create dispute error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create dispute.',
            error: error.message,
        });
    }
};

// @desc    Get user disputes
// @route   GET /api/disputes/my-disputes
// @access  Private
export const getMyDisputes = async (req, res) => {
    try {
        const disputes = await Dispute.find({ raised_by: req.user._id })
            .populate('order', 'order_number total_amount')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { disputes },
        });
    } catch (error) {
        console.error('Get my disputes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch disputes.',
            error: error.message,
        });
    }
};

// @desc    Get all disputes (Admin)
// @route   GET /api/disputes
// @access  Private (admin only)
export const getAllDisputes = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = status ? { status } : {};

        // Add search filter if provided
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query = {
                ...query,
                $or: [
                    { 'order.order_number': searchRegex },
                    { 'raised_by.name': searchRegex },
                    { description: searchRegex },
                ],
            };
        }

        const disputes = await Dispute.find(query)
            .populate('raised_by', 'name email')
            .populate('order', 'order_number total_amount')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Dispute.countDocuments(query);

        // Get status counts for dashboard stats
        const openCount = await Dispute.countDocuments({ status: 'open' });
        const underReviewCount = await Dispute.countDocuments({ status: 'under_review' });
        const resolvedCount = await Dispute.countDocuments({ status: 'resolved' });

        res.status(200).json({
            success: true,
            data: {
                disputes,
                open_count: openCount,
                under_review_count: underReviewCount,
                resolved_count: resolvedCount,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get all disputes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch disputes.',
            error: error.message,
        });
    }
};

// @desc    Resolve dispute (Admin)
// @route   PUT /api/disputes/:disputeId/resolve
// @access  Private (admin only)
export const resolveDispute = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { resolution, resolution_notes, admin_notes, refundAmount, refundStatus } = req.body;

        const dispute = await Dispute.findById(disputeId).populate('raised_by order');

        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found.',
            });
        }

        // Use service to approve dispute
        const updatedDispute = await disputeService.approveDispute(
            disputeId,
            req.user._id,
            resolution,
            refundAmount,
            resolution_notes
        );

        // Add admin notes
        updatedDispute.admin_notes = admin_notes;
        await updatedDispute.save();

        // Notify user
        await sendEmail({
            to: dispute.raised_by.email,
            subject: 'Your Dispute Has Been Resolved',
            htmlContent: `
                <h2>Dispute Resolved</h2>
                <p>Your dispute for order #${dispute.order.order_number} has been resolved.</p>
                <p><strong>Resolution:</strong> ${resolution.replace(/_/g, ' ')}</p>
                ${resolution_notes ? `<p><strong>Notes:</strong> ${resolution_notes}</p>` : ''}
                ${updatedDispute.refund ? `<p><strong>Refund Amount:</strong> $${updatedDispute.refund.amount}</p>` : ''}
            `,
        }).catch((err) => console.error('Failed to send dispute resolution email:', err));

        res.status(200).json({
            success: true,
            message: 'Dispute resolved successfully.',
            data: { dispute: updatedDispute },
        });
    } catch (error) {
        console.error('Resolve dispute error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resolve dispute.',
            error: error.message,
        });
    }
};

// @desc    Get single dispute details
// @route   GET /api/disputes/:disputeId
// @access  Private (consumer or admin)
export const getDispute = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const dispute = await Dispute.findById(disputeId)
            .populate('raised_by', 'name email phone')
            .populate('order')
            .populate('resolved_by', 'name')
            .populate('refund.transaction_id');

        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found.',
            });
        }

        // Check authorization (consumer or admin)
        if (
            dispute.raised_by._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this dispute.',
            });
        }

        res.status(200).json({
            success: true,
            data: { dispute },
        });
    } catch (error) {
        console.error('Get dispute error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dispute.',
            error: error.message,
        });
    }
};

// @desc    Mark dispute under review
// @route   PUT /api/disputes/:disputeId/mark-under-review
// @access  Private (admin only)
export const markDisputeUnderReview = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { notes } = req.body;

        const dispute = await disputeService.markUnderReview(disputeId, req.user._id, notes);

        res.status(200).json({
            success: true,
            message: 'Dispute marked as under review.',
            data: { dispute },
        });
    } catch (error) {
        console.error('Mark under review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark dispute under review.',
            error: error.message,
        });
    }
};

// @desc    Reject dispute
// @route   PUT /api/disputes/:disputeId/reject
// @access  Private (admin only)
export const rejectDisputeHandler = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { reason } = req.body;

        const dispute = await Dispute.findById(disputeId).populate('raised_by', 'email');

        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found.',
            });
        }

        const updatedDispute = await disputeService.rejectDispute(disputeId, req.user._id, reason);

        // Notify user
        await sendEmail({
            to: dispute.raised_by.email,
            subject: 'Dispute Resolution Update',
            htmlContent: `
                <h2>Dispute Decision</h2>
                <p>Your dispute has been reviewed and rejected.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            `,
        }).catch((err) => console.error('Failed to send rejection email:', err));

        res.status(200).json({
            success: true,
            message: 'Dispute rejected successfully.',
            data: { dispute: updatedDispute },
        });
    } catch (error) {
        console.error('Reject dispute error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject dispute.',
            error: error.message,
        });
    }
};

// @desc    Add consumer response
// @route   PUT /api/disputes/:disputeId/consumer-response
// @access  Private (consumer)
export const addConsumerResponseHandler = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { response } = req.body;

        const dispute = await Dispute.findById(disputeId);

        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found.',
            });
        }

        // Verify authorization
        if (dispute.raised_by.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add response to this dispute.',
            });
        }

        const updatedDispute = await disputeService.addConsumerResponse(disputeId, response);

        res.status(200).json({
            success: true,
            message: 'Consumer response added successfully.',
            data: { dispute: updatedDispute },
        });
    } catch (error) {
        console.error('Add consumer response error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add consumer response.',
            error: error.message,
        });
    }
};

// @desc    Add seller response
// @route   PUT /api/disputes/:disputeId/seller-response
// @access  Private (artisan/seller or admin)
export const addSellerResponseHandler = async (req, res) => {
    try {
        const { disputeId } = req.params;
        const { response } = req.body;

        const dispute = await Dispute.findById(disputeId).populate('order');

        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found.',
            });
        }

        // Verify authorization (seller/artisan or admin)
        const isAuthorized =
            req.user.role === 'admin' ||
            dispute.order.artisan?.toString() === req.user._id.toString() ||
            dispute.order.seller?.toString() === req.user._id.toString();

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add seller response to this dispute.',
            });
        }

        const updatedDispute = await disputeService.addSellerResponse(disputeId, response);

        res.status(200).json({
            success: true,
            message: 'Seller response added successfully.',
            data: { dispute: updatedDispute },
        });
    } catch (error) {
        console.error('Add seller response error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add seller response.',
            error: error.message,
        });
    }
};
