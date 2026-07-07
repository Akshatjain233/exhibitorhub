import QuoteRequest from '../models/QuoteRequest.js';
import * as quoteService from '../services/quoteService.js';
import { createNotification } from './notificationController.js';

// @desc    Create a quote request
// @route   POST /api/v1/quotes
// @access  Private (trader, artisan, consumer)
export const createQuoteRequest = async (req, res) => {
    try {
        const {
            recipient_id,
            item_type,
            item_id,
            item_name,
            quantity,
            message,
            lead_id,
            lead_source,
            lead_quality_score,
        } = req.body;

        if (!recipient_id || !item_type || !item_name) {
            return res.status(400).json({
                success: false,
                message: 'Recipient, item type, and item name are required.',
            });
        }

        const io = req.app.get('io');
        const { quote } = await quoteService.createQuote(
            {
                requesterId: req.user._id,
                requesterRole: req.user.role,
                requesterName: req.user.name,
                recipientId: recipient_id,
                item_type,
                item_id,
                item_name,
                quantity,
                message,
                lead_id,
                lead_source,
                lead_quality_score,
            },
            io
        );

        res.status(201).json({
            success: true,
            message: 'Quote request sent successfully.',
            data: { quote },
        });
    } catch (error) {
        console.error('Create quote request error:', error);
        const status = error.statusCode || 500;
        res.status(status).json({
            success: false,
            message: error.message || 'Failed to create quote request.',
        });
    }
};

// @desc    Get all quotes (sent or received)
// @route   GET /api/v1/quotes
// @access  Private
export const getQuotes = async (req, res) => {
    try {
        const { type = 'received', status, page = 1, limit = 20 } = req.query;
        const result = await quoteService.getQuotesByUser({
            userId: req.user._id,
            type,
            status,
            page,
            limit,
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Get quotes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quotes.',
            error: error.message,
        });
    }
};

// @desc    Get single quote request
// @route   GET /api/v1/quotes/:id
// @access  Private
export const getQuoteById = async (req, res) => {
    try {
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID format.',
            });
        }

        const quote = await QuoteRequest.findById(req.params.id)
            .populate('requester', 'name email phone_number profile_picture')
            .populate('recipient', 'name email phone_number profile_picture')
            .populate('item.item_id');

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote request not found.',
            });
        }

        // Only requester or recipient can view
        // Handle both populated docs and raw ObjectId values safely.
        const requesterId = quote.requester?._id
            ? quote.requester._id.toString()
            : quote.requester?.toString();
        const recipientId = quote.recipient?._id
            ? quote.recipient._id.toString()
            : quote.recipient?.toString();
        const currentUserId = req.user._id.toString();

        if (requesterId !== currentUserId && recipientId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this quote.',
            });
        }

        res.status(200).json({
            success: true,
            data: { quote },
        });
    } catch (error) {
        console.error('Get quote by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quote.',
            error: error.message,
        });
    }
};

// @desc    Respond to a quote request
// @route   POST /api/v1/quotes/:id/respond
// @access  Private (recipient only)
export const respondToQuote = async (req, res) => {
    try {
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID format.',
            });
        }

        const { price_per_unit, total_price, delivery_timeline, terms } = req.body;
        const parsedPricePerUnit = price_per_unit !== undefined && price_per_unit !== null && price_per_unit !== ''
            ? Number(price_per_unit)
            : null;
        const parsedTotalPrice = total_price !== undefined && total_price !== null && total_price !== ''
            ? Number(total_price)
            : null;
        const timeline = typeof delivery_timeline === 'string' ? delivery_timeline.trim() : '';
        const sanitizedTerms = typeof terms === 'string' ? terms.trim() : undefined;

        const hasValidPricePerUnit = parsedPricePerUnit !== null && Number.isFinite(parsedPricePerUnit) && parsedPricePerUnit > 0;
        const hasValidTotalPrice = parsedTotalPrice !== null && Number.isFinite(parsedTotalPrice) && parsedTotalPrice > 0;

        if (!hasValidPricePerUnit && !hasValidTotalPrice) {
            return res.status(400).json({
                success: false,
                message: 'Provide a valid positive price per unit or total price.',
            });
        }

        if (!timeline) {
            return res.status(400).json({
                success: false,
                message: 'Delivery timeline is required to respond to a quote.',
            });
        }

        const io = req.app.get('io');
        const { quote } = await quoteService.respondToQuote(
            {
                quoteId: req.params.id,
                recipientId: req.user._id,
                recipientName: req.user.name,
                price_per_unit: hasValidPricePerUnit ? parsedPricePerUnit : null,
                total_price: hasValidTotalPrice ? parsedTotalPrice : null,
                delivery_timeline: timeline,
                terms: sanitizedTerms || undefined,
            },
            io
        );

        res.status(200).json({
            success: true,
            message: 'Quote response sent successfully.',
            data: { quote },
        });
    } catch (error) {
        console.error('Respond to quote error:', error);
        const status = error.statusCode || 500;
        res.status(status).json({
            success: false,
            message: error.message || 'Failed to respond to quote.',
        });
    }
};

// @desc    Accept a quote response
// @route   POST /api/v1/quotes/:id/accept
// @access  Private (requester only)
export const acceptQuote = async (req, res) => {
    try {
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID format.',
            });
        }

        const io = req.app.get('io');
        const { quote } = await quoteService.acceptQuote(
            { quoteId: req.params.id, requesterId: req.user._id, requesterName: req.user.name },
            io
        );

        res.status(200).json({
            success: true,
            message: 'Quote accepted successfully.',
            data: { quote },
        });
    } catch (error) {
        console.error('Accept quote error:', error);
        const status = error.statusCode || 500;
        res.status(status).json({
            success: false,
            message: error.message || 'Failed to accept quote.',
        });
    }
};

// @desc    Reject a quote response
// @route   POST /api/v1/quotes/:id/reject
// @access  Private (requester only)
export const rejectQuote = async (req, res) => {
    try {
        const { reason } = req.body;
        const quote = await QuoteRequest.findById(req.params.id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote request not found.',
            });
        }

        // Only requester can reject
        if (quote.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the requester can reject this quote.',
            });
        }

        // Can only reject responded quotes
        if (quote.status !== 'responded') {
            return res.status(400).json({
                success: false,
                message: 'Quote must be responded to before rejecting.',
            });
        }

        // Update status
        quote.status = 'rejected';
        quote.rejected_at = new Date();
        quote.rejection_reason = reason;
        await quote.save();

        // Notify recipient
        const io = req.app.get('io');
        await createNotification(
            {
                user: quote.recipient,
                category: 'quote',
                title: 'Quote Rejected',
                message: `${req.user.name} rejected your quote for ${quote.item.item_name}`,
                actor: req.user._id,
                related_entity: {
                    entity_type: 'quote',
                    entity_id: quote._id,
                },
            },
            io
        );

        res.status(200).json({
            success: true,
            message: 'Quote rejected successfully.',
            data: { quote },
        });
    } catch (error) {
        console.error('Reject quote error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject quote.',
            error: error.message,
        });
    }
};

// @desc    Cancel a quote request
// @route   DELETE /api/v1/quotes/:id
// @access  Private (requester only)
export const cancelQuote = async (req, res) => {
    try {
        const { reason } = req.body;
        const quote = await QuoteRequest.findById(req.params.id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote request not found.',
            });
        }

        // Only requester can cancel
        if (quote.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the requester can cancel this quote.',
            });
        }

        // Can't cancel accepted quotes
        if (quote.status === 'accepted') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel an accepted quote.',
            });
        }

        // Update status
        quote.status = 'cancelled';
        quote.cancelled_at = new Date();
        quote.cancellation_reason = reason;
        await quote.save();

        // Notify recipient if quote was responded
        if (quote.status === 'responded') {
            const io = req.app.get('io');
            await createNotification(
                {
                    user: quote.recipient,
                    category: 'quote',
                    title: 'Quote Request Cancelled',
                    message: `${req.user.name} cancelled the quote request for ${quote.item.item_name}`,
                    actor: req.user._id,
                    related_entity: {
                        entity_type: 'quote',
                        entity_id: quote._id,
                    },
                },
                io
            );
        }

        res.status(200).json({
            success: true,
            message: 'Quote cancelled successfully.',
            data: { quote },
        });
    } catch (error) {
        console.error('Cancel quote error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel quote.',
            error: error.message,
        });
    }
};

// @desc    Get quote statistics
// @route   GET /api/v1/quotes/stats
// @access  Private
export const getQuoteStats = async (req, res) => {
    try {
        const sentStats = await QuoteRequest.aggregate([
            { $match: { requester: req.user._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const receivedStats = await QuoteRequest.aggregate([
            { $match: { recipient: req.user._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const stats = {
            sent: {
                total: 0,
                pending: 0,
                responded: 0,
                accepted: 0,
                rejected: 0,
                expired: 0,
                cancelled: 0,
            },
            received: {
                total: 0,
                pending: 0,
                responded: 0,
                accepted: 0,
                rejected: 0,
                expired: 0,
                cancelled: 0,
            },
        };

        sentStats.forEach(stat => {
            stats.sent[stat._id] = stat.count;
            stats.sent.total += stat.count;
        });

        receivedStats.forEach(stat => {
            stats.received[stat._id] = stat.count;
            stats.received.total += stat.count;
        });

        res.status(200).json({
            success: true,
            data: { stats },
        });
    } catch (error) {
        console.error('Get quote stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quote statistics.',
            error: error.message,
        });
    }
};
