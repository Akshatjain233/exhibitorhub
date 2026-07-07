/**
 * quoteService.js
 * Pure business-logic layer for quote operations.
 * Controllers call these helpers and handle HTTP serialisation.
 */

import QuoteRequest from '../models/QuoteRequest.js';
import User from '../models/User.js';
import { createNotification } from '../controllers/notificationController.js';
import {
    trackQuoteAccepted,
    trackQuoteSentFromLead,
} from './leadPerformanceService.js';

/**
 * Build a QuoteRequest document and persist it.
 * @param {object} params
 * @param {string} params.requesterId
 * @param {string} params.requesterRole  – 'trader' | 'artisan' | 'consumer'
 * @param {string} params.requesterName
 * @param {string} params.recipientId
 * @param {string} params.item_type     – 'raw_material' | 'product' | 'service' | 'lead'
 * @param {string} [params.item_id]
 * @param {string} params.item_name
 * @param {number} [params.quantity]
 * @param {string} [params.message]
 * @param {object} io                   – Socket.IO instance (may be null)
 * @returns {{ quote: object } | never}
 */
export const createQuote = async (
    {
        requesterId,
        requesterRole,
        requesterName,
        recipientId,
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
) => {
    const allowedItemTypes = ['raw_material', 'bulk_raw_material', 'product', 'service', 'lead'];
    if (!allowedItemTypes.includes(item_type)) {
        const err = new Error(`Invalid item_type '${item_type}'. Allowed: ${allowedItemTypes.join(', ')}.`);
        err.statusCode = 400;
        throw err;
    }

    const recipient = await User.findById(recipientId).select('role');
    if (!recipient) {
        const err = new Error('Recipient not found.');
        err.statusCode = 404;
        throw err;
    }

    const requester_type = requesterRole === 'trader' ? 'trader'
        : requesterRole === 'artisan' ? 'artisan'
        : requesterRole === 'supplier' ? 'supplier'
        : 'consumer';

    let recipient_type;
    if (recipient.role === 'artisan') recipient_type = 'artisan';
    else if (recipient.role === 'trader') recipient_type = 'trader';
    else if (recipient.role === 'supplier') recipient_type = 'supplier';
    else if (recipient.role === 'consumer') recipient_type = 'consumer';
    else {
        const err = new Error(`Recipient role '${recipient.role}' is not supported for quotes.`);
        err.statusCode = 400;
        throw err;
    }

    let item_ref_model = null;
    if (item_type === 'raw_material') item_ref_model = 'RawMaterial';
    else if (item_type === 'product') item_ref_model = 'Product';
    else if (item_type === 'service' || item_type === 'lead') item_ref_model = 'User';

    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);

    const quote = await QuoteRequest.create({
        requester: requesterId,
        requester_type,
        recipient: recipientId,
        recipient_type,
        item: {
            item_type,
            item_id: item_id || null,
            item_ref_model,
            item_name,
            lead_id: lead_id || null,
            lead_context: {
                source: lead_source || 'other',
                quality_score_at_request: lead_quality_score,
            },
        },
        quantity: quantity || 1,
        message,
        expires_at,
    });

    if (lead_id && requesterRole === 'supplier') {
        await trackQuoteSentFromLead({ supplierId: requesterId, leadId: lead_id });
    }

    await createNotification(
        {
            user: recipientId,
            category: 'quote',
            title: 'New Quote Request',
            message: `${requesterName} requested a quote for ${item_name}`,
            actor: requesterId,
            related_entity: { entity_type: 'quote', entity_id: quote._id },
        },
        io
    );

    return { quote };
};

/**
 * Fetch quotes (sent or received) for a user with optional status filter.
 */
export const getQuotesByUser = async ({ userId, type = 'received', status, page = 1, limit = 20 }) => {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = type === 'sent' ? { requester: userId } : { recipient: userId };
    if (status) query.status = status;

    const [quotes, total] = await Promise.all([
        QuoteRequest.find(query)
            .populate('requester', 'name email phone_number profile_picture')
            .populate('recipient', 'name email phone_number profile_picture')
            .populate('item.item_id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        QuoteRequest.countDocuments(query),
    ]);

    return {
        quotes,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    };
};

/**
 * Add a response to a quote (recipient only).
 */
export const respondToQuote = async (
    { quoteId, recipientId, recipientName, price_per_unit, total_price, delivery_timeline, terms },
    io
) => {
    const quote = await QuoteRequest.findById(quoteId);
    if (!quote) {
        const err = new Error('Quote request not found.'); err.statusCode = 404; throw err;
    }
    if (quote.recipient.toString() !== recipientId.toString()) {
        const err = new Error('Only the recipient can respond to this quote.'); err.statusCode = 403; throw err;
    }
    if (quote.status !== 'pending') {
        const err = new Error(`Quote is already ${quote.status}.`); err.statusCode = 400; throw err;
    }

    const now = new Date();
    if (quote.expires_at && quote.expires_at <= now) {
        await QuoteRequest.updateOne(
            { _id: quoteId, status: 'pending' },
            { $set: { status: 'expired' } }
        );
        const err = new Error('Quote has expired and cannot be responded to.'); err.statusCode = 400; throw err;
    }

    const quantity = Number(quote.quantity) || 1;
    if (!Number.isFinite(quantity) || quantity <= 0) {
        const err = new Error('Invalid quote quantity.'); err.statusCode = 400; throw err;
    }

    const parsedPricePerUnit = price_per_unit !== undefined && price_per_unit !== null ? Number(price_per_unit) : null;
    const parsedTotalPrice = total_price !== undefined && total_price !== null ? Number(total_price) : null;

    const hasPricePerUnit = parsedPricePerUnit !== null && Number.isFinite(parsedPricePerUnit) && parsedPricePerUnit > 0;
    const hasTotalPrice = parsedTotalPrice !== null && Number.isFinite(parsedTotalPrice) && parsedTotalPrice > 0;

    if (!hasPricePerUnit && !hasTotalPrice) {
        const err = new Error('Valid pricing is required to respond to quote.'); err.statusCode = 400; throw err;
    }

    const normalizedDeliveryTimeline = typeof delivery_timeline === 'string' ? delivery_timeline.trim() : '';
    if (!normalizedDeliveryTimeline) {
        const err = new Error('Delivery timeline is required to respond to quote.'); err.statusCode = 400; throw err;
    }

    const finalPricePerUnit = hasPricePerUnit
        ? Number(parsedPricePerUnit.toFixed(2))
        : Number((parsedTotalPrice / quantity).toFixed(2));

    const finalTotalPrice = hasTotalPrice
        ? Number(parsedTotalPrice.toFixed(2))
        : Number((parsedPricePerUnit * quantity).toFixed(2));

    const normalizedTerms = typeof terms === 'string' ? terms.trim() : undefined;
    const responseTimeHours = Number(((now.getTime() - new Date(quote.createdAt).getTime()) / (1000 * 60 * 60)).toFixed(2));

    const updatedQuote = await QuoteRequest.findOneAndUpdate(
        {
            _id: quoteId,
            recipient: recipientId,
            status: 'pending',
            $or: [
                { expires_at: { $exists: false } },
                { expires_at: { $gt: now } },
            ],
        },
        {
            $set: {
                status: 'responded',
                quote_response: {
                    price_per_unit: finalPricePerUnit,
                    total_price: finalTotalPrice,
                    delivery_timeline: normalizedDeliveryTimeline,
                    terms: normalizedTerms,
                    responded_at: now,
                    response_time_hours: responseTimeHours,
                },
            },
        },
        { new: true }
    );

    if (!updatedQuote) {
        const latest = await QuoteRequest.findById(quoteId).select('recipient status expires_at');
        if (!latest) {
            const err = new Error('Quote request not found.'); err.statusCode = 404; throw err;
        }
        if (latest.recipient.toString() !== recipientId.toString()) {
            const err = new Error('Only the recipient can respond to this quote.'); err.statusCode = 403; throw err;
        }
        if (latest.status !== 'pending') {
            const err = new Error(`Quote is already ${latest.status}.`); err.statusCode = 400; throw err;
        }

        await QuoteRequest.updateOne(
            {
                _id: quoteId,
                status: 'pending',
                expires_at: { $lte: now },
            },
            { $set: { status: 'expired' } }
        );

        const err = new Error('Quote has expired and cannot be responded to.'); err.statusCode = 400; throw err;
    }

    await createNotification(
        {
            user: updatedQuote.requester,
            category: 'quote',
            title: 'Quote Response Received',
            message: `${recipientName} responded to your quote request for ${updatedQuote.item.item_name}`,
            actor: recipientId,
            related_entity: { entity_type: 'quote', entity_id: updatedQuote._id },
        },
        io
    );

    return { quote: updatedQuote };
};

/**
 * Accept a responded quote (requester only).
 */
export const acceptQuote = async ({ quoteId, requesterId, requesterName }, io) => {
    const acceptedAt = new Date();
    const quote = await QuoteRequest.findOneAndUpdate(
        {
            _id: quoteId,
            requester: requesterId,
            status: 'responded',
        },
        {
            $set: {
                status: 'accepted',
                accepted_at: acceptedAt,
            },
        },
        { new: true }
    );

    if (!quote) {
        const existing = await QuoteRequest.findById(quoteId).select('requester status');
        if (!existing) {
            const err = new Error('Quote request not found.'); err.statusCode = 404; throw err;
        }
        if (existing.requester.toString() !== requesterId.toString()) {
            const err = new Error('Only the requester can accept this quote.'); err.statusCode = 403; throw err;
        }
        const err = new Error('Quote must be responded to before accepting.'); err.statusCode = 400; throw err;
    }

    await createNotification(
        {
            user: quote.recipient,
            category: 'quote',
            title: 'Quote Accepted',
            message: `${requesterName} accepted your quote for ${quote.item.item_name}`,
            actor: requesterId,
            related_entity: { entity_type: 'quote', entity_id: quote._id },
        },
        io
    );

    await trackQuoteAccepted({ quote });

    return { quote };
};

/**
 * Expire stale pending quotes (called from a cron job).
 * Returns the count of quotes expired.
 */
export const expireStaleQuotes = async () => {
    const result = await QuoteRequest.updateMany(
        { status: 'pending', expires_at: { $lt: new Date() } },
        { $set: { status: 'expired' } }
    );
    return result.modifiedCount;
};
