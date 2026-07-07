import TraderProfile from '../models/TraderProfile.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import LeadAccess from '../models/LeadAccess.js';
import User from '../models/User.js';
import QuoteRequest from '../models/QuoteRequest.js';
import RawMaterial from '../models/RawMaterial.js';
import Product from '../models/Product.js';
import B2BOrder from '../models/B2BOrder.js';
import CraftTag from '../models/CraftTag.js';
import { createNotification } from './notificationController.js';
import * as quoteService from '../services/quoteService.js';

const escapeRegex = (input = '') => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get trader profile
// @route   GET /api/b2b/trader/:id
// @access  Private (trader, admin)
export const getTraderProfile = async (req, res) => {
    try {
        // Admin can view any trader profile, traders can only view their own
        const targetUserId = req.user.role === 'admin' ? req.params.id : req.user._id;
        
        // If non-admin tries to access someone else's profile
        if (req.user.role !== 'admin' && req.params.id !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own profile.',
            });
        }

        const profile = await TraderProfile.findOne({ user: targetUserId })
            .populate('user', 'name email phone_number');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Trader profile not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: { profile },
        });
    } catch (error) {
        console.error('Get trader profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trader profile.',
            error: error.message,
        });
    }
};

// @desc    Update trader profile
// @route   PUT /api/b2b/trader/:id
// @access  Private (trader only)
export const updateTraderProfile = async (req, res) => {
    try {
        // Traders can only update their own profile
        if (req.params.id !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own profile.',
            });
        }

        const { company_name, gst_number, business_type, office_address, operating_regions } = req.body;

        const updateData = {};
        if (company_name) updateData.company_name = company_name;
        if (gst_number) updateData.gst_number = gst_number;
        if (business_type) updateData.business_type = business_type;
        if (office_address) updateData.office_address = office_address;
        if (operating_regions) updateData.operating_regions = operating_regions;

        const profile = await TraderProfile.findOneAndUpdate(
            { user: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Trader profile not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Trader profile updated successfully.',
            data: { profile },
        });
    } catch (error) {
        console.error('Update trader profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update trader profile.',
            error: error.message,
        });
    }
};

// @desc    Get artisan leads for B2B
// @route   GET /api/trader/leads
// @access  Private (trader only)
export const getLeads = async (req, res) => {
    try {
        const { art_type, region, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query for artisan search
        const query = {};
        if (art_type) {
            const normalizedArtType = String(art_type).trim();
            const matchingTags = await CraftTag.find({
                name_english: { $regex: new RegExp(`^${escapeRegex(normalizedArtType)}$`, 'i') },
            }).select('_id');

            if (!matchingTags.length) {
                return res.status(200).json({
                    success: true,
                    data: {
                        leads: [],
                        pagination: {
                            page: parseInt(page),
                            limit: parseInt(limit),
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

        // Get artisans matching criteria
        const artisans = await ArtisanProfile.find(query)
            .populate('user', 'name email phone_number')
            .populate('craft_tags', 'name_english')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ total_views: -1, rating_avg: -1 });

        // Filter out artisans with null/missing user data
        const validArtisans = artisans.filter(artisan => artisan.user != null);

        const total = await ArtisanProfile.countDocuments(query);

        // Check if trader has premium access
        const traderProfile = await TraderProfile.findOne({ user: req.user._id });
        const isPremium = traderProfile?.is_premium_member;

        // Hide details for non-premium users (show only 2 leads)
        let visibleLeads = validArtisans;
        if (!isPremium && validArtisans.length > 2) {
            visibleLeads = validArtisans.slice(0, 2).map(artisan => ({
                ...artisan.toObject(),
                user: artisan.user ? {
                    name: artisan.user.name || 'Unknown',
                    email: '***@***.com', // Hidden
                    phone_number: '***-***-****', // Hidden
                } : null,
            }));

            // Add locked indicator for remaining leads
            const lockedCount = validArtisans.length - 2;

            return res.status(200).json({
                success: true,
                data: {
                    leads: visibleLeads,
                    lockedCount,
                    message: `${lockedCount} more leads available. Upgrade to premium to unlock.`,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit)),
                    },
                },
            });
        }

        res.status(200).json({
            success: true,
            data: {
                leads: visibleLeads,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leads.',
            error: error.message,
        });
    }
};

// @desc    Upgrade to premium membership
// @route   POST /api/trader/upgrade-premium
// @access  Private (trader only)
export const upgradeToPremium = async (req, res) => {
    try {
        // In production, process payment first
        // For now, just update the profile

        const profile = await TraderProfile.findOneAndUpdate(
            { user: req.user._id },
            {
                is_premium_member: true,
                premium_since: new Date(),
            },
            { new: true }
        );

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

// @desc    Request quote from artisan/trader material seller
// @route   POST /api/b2b/trader/quote-request
// @access  Private (trader only)
export const requestQuote = async (req, res) => {
    try {
        const {
            artisan_id,
            recipient_id,
            product_details,
            quantity,
            delivery_requirements,
            source,
        } = req.body;

        const targetUserId = recipient_id || artisan_id;
        const requesterRole = req.user.role;

        if (requesterRole !== 'trader' && requesterRole !== 'artisan') {
            return res.status(403).json({
                success: false,
                message: 'Only traders and artisans can request quotes.',
            });
        }

        if (!targetUserId || !product_details) {
            return res.status(400).json({
                success: false,
                message: 'Recipient ID and product details are required.',
            });
        }

        const recipient = await User.findById(targetUserId).select('role');
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found.',
            });
        }

        // Determine recipient type
        const recipient_type = recipient.role === 'artisan' ? 'artisan'
            : 'trader';

        // Create quote request with 7-day expiry
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + 7);

        const quoteRequest = await QuoteRequest.create({
            requester: req.user._id,
            requester_type: requesterRole,
            recipient: targetUserId,
            recipient_type,
            item: {
                item_type: source === 'raw_material' ? 'raw_material' : 'lead',
                item_id: null,
                item_ref_model: 'User',
                item_name: product_details || 'Product inquiry',
            },
            quantity: quantity || 1,
            message: delivery_requirements,
            expires_at,
        });

        // Create notification for recipient
        const io = req.app.get('io');
        await createNotification(
            {
                user: targetUserId,
                category: 'quote',
                title: 'New Quote Request',
                message: `You have received a quote request for ${product_details}`,
                actor: req.user._id,
                related_entity: {
                    entity_type: 'quote',
                    entity_id: quoteRequest._id,
                },
                action_data: {
                    source: source || 'b2b',
                    requester_id: req.user._id,
                    requester_role: requesterRole,
                    trader_id: req.user._id,
                    product_details,
                    quantity,
                    delivery_requirements,
                },
            },
            io
        );

        res.status(200).json({
            success: true,
            message: 'Quote request sent successfully.',
            data: { quote: quoteRequest },
        });
    } catch (error) {
        console.error('Request quote error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to request quote.',
            error: error.message,
        });
    }
};

// @desc    Get trader stats
// @route   GET /api/trader/stats
// @access  Private (trader only)
export const getTraderStats = async (req, res) => {
    try {
        const profile = await TraderProfile.findOne({ user: req.user._id });
        const leadsCount = await LeadAccess.countDocuments({ trader_id: req.user._id });
        
        const stats = {
            traderId: req.user._id,
            leadsUnlocked: profile?.leads_unlocked || 0,
            leadsCount: leadsCount,
            totalRevenue: profile?.total_revenue || 0,
            activeListings: 0,
            completedDeals: 0,
            profileCompletion: profile ? Math.round((profile.completion_percentage || 0)) : 0,
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get trader stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trader stats.',
            error: error.message
        });
    }
};

// ─── Material Management (supply-side capability for traders) ─────────────────

// @desc    Post a raw material listing
// @route   POST /api/b2b/trader/materials
// @access  Private (trader with can_supply_materials)
export const addTraderMaterial = async (req, res) => {
    try {
        const profile = await TraderProfile.findOne({ user: req.user._id });
        if (!profile?.can_supply_materials) {
            return res.status(403).json({
                success: false,
                message: 'Enable supply capability in your trader profile to post raw materials.',
            });
        }

        const { name, category, description, price_unit, is_organic, images, stock_quantity, unit, availability } = req.body;

        if (!name || !price_unit) {
            return res.status(400).json({ success: false, message: 'Name and price_unit are required.' });
        }

        const parsedPriceUnit = parseFloat(price_unit);
        if (!Number.isFinite(parsedPriceUnit) || parsedPriceUnit < 0) {
            return res.status(400).json({ success: false, message: 'price_unit must be a valid non-negative number.' });
        }

        const parsedStockQuantity = Number.parseInt(stock_quantity, 10);
        const sanitizedStockQuantity = Number.isFinite(parsedStockQuantity)
            ? parsedStockQuantity
            : (stock_quantity === undefined || stock_quantity === null || stock_quantity === '' ? 0 : NaN);

        if (!Number.isFinite(sanitizedStockQuantity) || sanitizedStockQuantity < 0) {
            return res.status(400).json({ success: false, message: 'stock_quantity must be a valid non-negative integer.' });
        }

        const material = await RawMaterial.create({
            seller: req.user._id,
            posted_by_role: 'trader',
            name,
            category,
            description: description || '',
            price_unit: parsedPriceUnit,
            is_organic: is_organic || false,
            images: images || [],
            stock_quantity: sanitizedStockQuantity,
            unit: unit || 'kg',
            availability: availability !== undefined ? availability : true,
        });

        await TraderProfile.findOneAndUpdate(
            { user: req.user._id },
            { $inc: { total_materials_posted: 1 } }
        );

        res.status(201).json({ success: true, message: 'Material posted successfully.', data: { material } });
    } catch (error) {
        console.error('Add trader material error:', error);
        res.status(500).json({ success: false, message: 'Failed to post material.', error: error.message });
    }
};

// @desc    Update a trader-owned raw material
// @route   PATCH /api/b2b/trader/materials/:id
// @access  Private (trader, owner)
export const updateTraderMaterial = async (req, res) => {
    try {
        const material = await RawMaterial.findOne({ _id: req.params.id, seller: req.user._id });
        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found or not owned by you.' });
        }

        const allowed = ['name', 'category', 'description', 'price_unit', 'is_organic', 'images', 'stock_quantity', 'unit', 'availability'];
        allowed.forEach(key => {
            if (req.body[key] !== undefined) material[key] = req.body[key];
        });
        await material.save();

        res.status(200).json({ success: true, message: 'Material updated.', data: { material } });
    } catch (error) {
        console.error('Update trader material error:', error);
        res.status(500).json({ success: false, message: 'Failed to update material.', error: error.message });
    }
};

// @desc    Delete a trader-owned raw material
// @route   DELETE /api/b2b/trader/materials/:id
// @access  Private (trader, owner)
export const deleteTraderMaterial = async (req, res) => {
    try {
        const material = await RawMaterial.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found or not owned by you.' });
        }

        const updatedProfile = await TraderProfile.findOneAndUpdate(
            { user: req.user._id, total_materials_posted: { $gt: 0 } },
            { $inc: { total_materials_posted: -1 } },
            { new: true }
        );

        if (!updatedProfile) {
            console.warn(`TraderProfile not decremented for user ${req.user._id}.`);
        }

        res.status(200).json({ success: true, message: 'Material deleted.' });
    } catch (error) {
        console.error('Delete trader material error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete material.', error: error.message });
    }
};

// @desc    Get all materials posted by the logged-in trader
// @route   GET /api/b2b/trader/my-materials
// @access  Private (trader)
export const getMyTraderMaterials = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = { seller: req.user._id, posted_by_role: 'trader' };
        const normalizedSearch = typeof search === 'string' ? search.trim() : '';
        if (normalizedSearch) query.name = new RegExp(escapeRegex(normalizedSearch), 'i');

        const [materials, total] = await Promise.all([
            RawMaterial.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            RawMaterial.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: {
                materials,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
            },
        });
    } catch (error) {
        console.error('Get my trader materials error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch materials.', error: error.message });
    }
};

// ─── Bulk Product Quotes & Orders ─────────────────────────────────────────────

// @desc    Trader sends a bulk quote request to an artisan for a product
// @route   POST /api/b2b/trader/quote-product
// @access  Private (trader)
export const quoteProduct = async (req, res) => {
    try {
        const { product_id, quantity, message } = req.body;

        if (!product_id || !quantity) {
            return res.status(400).json({ success: false, message: 'product_id and quantity are required.' });
        }

        const product = await Product.findById(product_id).select('name artisan is_bulk_available');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        if (!product.is_bulk_available) {
            return res.status(400).json({ success: false, message: 'This product is not available for bulk orders.' });
        }

        const io = req.app.get('io');
        const { quote } = await quoteService.createQuote(
            {
                requesterId: req.user._id,
                requesterRole: 'trader',
                requesterName: req.user.name,
                recipientId: product.artisan.toString(),
                item_type: 'product',
                item_id: product_id,
                item_name: product.name,
                quantity,
                message,
            },
            io
        );

        res.status(201).json({ success: true, message: 'Bulk quote request sent to artisan.', data: { quote } });
    } catch (error) {
        console.error('Quote product error:', error);
        const status = error.statusCode || 500;
        res.status(status).json({ success: false, message: error.message || 'Failed to send bulk quote.' });
    }
};

// @desc    Trader places a direct bulk order on a bulk-available product
// @route   POST /api/b2b/trader/bulk-product-order
// @access  Private (trader)
export const createBulkProductOrder = async (req, res) => {
    try {
        const { product_id, quantity, delivery_address, notes } = req.body;

        if (!product_id || !quantity) {
            return res.status(400).json({ success: false, message: 'product_id and quantity are required.' });
        }

        const product = await Product.findById(product_id).select('name price artisan is_bulk_available bulk_min_quantity bulk_price_per_unit');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        if (!product.is_bulk_available) {
            return res.status(400).json({ success: false, message: 'This product is not available for bulk orders.' });
        }

        if (product.bulk_min_quantity && quantity < product.bulk_min_quantity) {
            return res.status(400).json({
                success: false,
                message: `Minimum bulk quantity for this product is ${product.bulk_min_quantity}.`,
            });
        }

        const unit_price = product.bulk_price_per_unit ?? product.price;
        const parsedUnitPrice = Number(unit_price);
        if (unit_price === null || unit_price === undefined || !Number.isFinite(parsedUnitPrice) || parsedUnitPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Product pricing is not configured for bulk orders.',
            });
        }
        const total_price = parsedUnitPrice * quantity;

        const order = await B2BOrder.create({
            order_type: 'product_bulk',
            trader: req.user._id,
            product: product_id,
            artisan: product.artisan,
            material_name: product.name,
            quantity,
            unit: 'piece',
            unit_price: parsedUnitPrice,
            total_price,
            delivery_address: delivery_address || null,
            notes: notes || '',
        });

        // Notify artisan
        const io = req.app.get('io');
        await createNotification(
            {
                user: product.artisan,
                category: 'order',
                title: 'New Bulk Order',
                message: `${req.user.name} placed a bulk order for ${quantity} unit(s) of ${product.name}`,
                actor: req.user._id,
                related_entity: { entity_type: 'b2b_order', entity_id: order._id },
            },
            io
        );

        res.status(201).json({ success: true, message: 'Bulk product order placed successfully.', data: { order } });
    } catch (error) {
        console.error('Create bulk product order error:', error);
        res.status(500).json({ success: false, message: 'Failed to place bulk order.', error: error.message });
    }
};
