import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';
import B2BOrder from '../models/B2BOrder.js';
import RawMaterial from '../models/RawMaterial.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createRazorpayOrder } from '../services/razorpayService.js';
import { trackOrderCreation, trackOrderCompletion } from '../services/analyticsService.js';

const STATUS_ALIASES = {
    Pending: 'placed',
    Escrow_Held: 'confirmed',
    Shipped: 'shipped',
    Delivered: 'delivered',
    Completed: 'delivered',
    Dispute: 'disputed',
    placed: 'placed',
    confirmed: 'confirmed',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
    disputed: 'disputed',
};

const VALID_ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled', 'disputed'];

const VALID_STATUS_TRANSITIONS = {
    placed: ['confirmed', 'cancelled', 'disputed'],
    confirmed: ['shipped', 'cancelled', 'disputed'],
    shipped: ['delivered', 'disputed'],
    delivered: ['disputed'],
    cancelled: [],
    disputed: [],
};

const normalizeOrderStatus = (status) => {
    if (!status) return status;
    return STATUS_ALIASES[status] || status.toLowerCase();
};

// @desc    Create an order
// @route   POST /api/orders
// @access  Private (consumer only)
export const createOrder = async (req, res) => {
    try {
        const { items, delivery_address, customer_note } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order items are required.',
            });
        }

        console.log('📦 [createOrder] Received items:', JSON.stringify(items, null, 2));

        const artisanBuckets = new Map();

        for (const item of items) {
            if (!item.product) {
                console.error('❌ Item missing product ID:', item);
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have a product ID.',
                });
            }

            console.log(`🔍 Looking up product: ${item.product}`);
            const product = await Product.findById(item.product);

            if (!product) {
                console.error(`❌ Product not found: ${item.product}`);
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}. Please refresh and try again.`,
                });
            }

            if (!product.availability) {
                console.warn(`⚠️ Product not available: ${product.name} (${product._id})`);
                return res.status(400).json({
                    success: false,
                    message: `Product "${product.name}" is not available.`,
                });
            }

            // Prevent artisans from ordering their own listed products
            if (
                req.user.role === 'artisan' &&
                product.artisan &&
                product.artisan.toString() === req.user._id.toString()
            ) {
                return res.status(400).json({
                    success: false,
                    message: `You cannot order your own product: ${product.name}.`,
                });
            }

            const quantity = item.quantity || 1;
            const artisanKey = product.artisan.toString();

            if (!artisanBuckets.has(artisanKey)) {
                artisanBuckets.set(artisanKey, {
                    artisan: product.artisan,
                    total_amount: 0,
                    items: [],
                });
            }

            const bucket = artisanBuckets.get(artisanKey);
            bucket.total_amount += product.price * quantity;
            bucket.items.push({
                product: product._id,
                quantity,
                price_at_purchase: product.price,
            });

            console.log(`✅ Added item: ${product.name} x${quantity} @ ₹${product.price} = ₹${product.price * quantity}`);
        }

        // Calculate combined total for Razorpay order
        let combinedTotal = 0;
        for (const bucket of artisanBuckets.values()) {
            combinedTotal += bucket.total_amount;
        }

        console.log(`💰 Order total: ₹${combinedTotal} for ${artisanBuckets.size} artisan(s)`);

        // Create Razorpay order
        const razorpayOrder = await createRazorpayOrder(
            combinedTotal,
            `rcpt_${Date.now()}`
        );

        const orders = [];

        for (const [artisanKey, bucket] of artisanBuckets.entries()) {
            const deliveryOTP = Math.floor(100000 + Math.random() * 900000).toString();
            const otpHash = await bcrypt.hash(deliveryOTP, 10);

            const order = await Order.create({
                consumer: req.user._id,
                artisan: bucket.artisan,
                items: bucket.items,
                total_amount: bucket.total_amount,
                delivery_address: delivery_address || null,
                delivery_otp_hash: otpHash,
                delivery_otp: deliveryOTP,
                razorpay_order_id: razorpayOrder.id,
                customer_note: customer_note || '',
                order_status: 'placed',
                payment_status: 'pending',
            });

            orders.push(order);
            console.log(`✅ Order created: ${order._id} for artisan ${artisanKey}`);

            // Track order creation in analytics (fire-and-forget)
            trackOrderCreation(order._id, order.artisan, order.total_amount).catch(err =>
                console.error('[Analytics] trackOrderCreation error:', err)
            );
        }

        res.status(201).json({
            success: true,
            message: orders.length > 1
                ? 'Orders created successfully for multiple artisans.'
                : 'Order created successfully.',
            data: {
                orders,
                order: orders[0],
                razorpay_order_id: razorpayOrder.id,
                razorpay_key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SLYAr0QqnA1HkO',
                amount: combinedTotal,
            },
        });
    } catch (error) {
        console.error('❌ Create order error:', error.message, error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to create order.',
            error: error.message,
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
             return res.status(400).json({ success: false, message: 'Invalid order ID format.' });
        }

        const order = await Order.findById(orderId)
            .populate('consumer', 'name email phone_number')
            .populate('artisan', 'name email phone_number')
            .populate('items.product', 'name images price is_bulk_available bulk_min_quantity bulk_price_per_unit bulk_notes');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        // Verify access
        const isConsumer = order.consumer._id.toString() === req.user._id.toString();
        const isArtisan = order.artisan._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isConsumer && !isArtisan && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order.',
            });
        }

        const orderData = order.toObject();
        if (!isConsumer && !isAdmin) {
            delete orderData.delivery_otp;
        }

        res.status(200).json({
            success: true,
            data: { order: orderData },
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order.',
            error: error.message,
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:orderId/status
// @access  Private (artisan/admin only)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
             return res.status(400).json({ success: false, message: 'Invalid order ID format.' });
        }
        
        const { status, artisan_note } = req.body;

        if (!status && !artisan_note) {
            return res.status(400).json({
                success: false,
                message: 'Provide status or artisan_note to update.',
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        // Verify authorization
        const isArtisan = order.artisan.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isArtisan && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this order.',
            });
        }

        // Update artisan note if provided
        if (artisan_note !== undefined) {
            order.artisan_note = artisan_note.slice(0, 500);
        }

        // Update status if provided
        if (status) {
            const normalizedStatus = normalizeOrderStatus(status);

            if (!VALID_ORDER_STATUSES.includes(normalizedStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid order status.',
                });
            }

            const currentStatus = order.order_status || 'placed';
            const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

            // Compatibility path for orders stuck at `placed` even after successful payment.
            // If artisan marks shipped and payment is already verified, auto-promote placed -> confirmed -> shipped.
            const canAutoPromotePaidOrder =
                currentStatus === 'placed' &&
                normalizedStatus === 'shipped' &&
                (order.payment_status === 'paid' || order.payment_status === 'completed');

            if (
                currentStatus === 'placed' &&
                (normalizedStatus === 'confirmed' || normalizedStatus === 'shipped') &&
                !(order.payment_status === 'paid' || order.payment_status === 'completed')
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment is not confirmed yet. Please wait for payment confirmation before shipping.',
                });
            }

            if (
                normalizedStatus !== currentStatus &&
                !allowedTransitions.includes(normalizedStatus) &&
                !canAutoPromotePaidOrder
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status transition from ${currentStatus} to ${normalizedStatus}.`,
                });
            }

            order.order_status = normalizedStatus;
        }
        await order.save();

        // If order moved to delivered, track completion analytics
        if (order.order_status === 'delivered') {
            trackOrderCompletion(order._id, order.artisan, order.total_amount).catch(err =>
                console.error('[Analytics] trackOrderCompletion error:', err)
            );
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully.',
            data: { order },
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status.',
            error: error.message,
        });
    }
};

// @desc    Verify delivery with OTP
// @route   POST /api/orders/:orderId/verify-delivery
// @access  Private (consumer only)
export const verifyDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
             return res.status(400).json({ success: false, message: 'Invalid order ID format.' });
        }

        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'OTP is required.',
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        // Verify consumer
        if (order.consumer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to verify this order.',
            });
        }

        // Verify OTP
        const isOTPValid = await bcrypt.compare(otp, order.delivery_otp_hash);

        if (!isOTPValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP.',
            });
        }

        if (!['shipped', 'delivered'].includes(order.order_status)) {
            return res.status(400).json({
                success: false,
                message: 'Order must be shipped before delivery verification.',
            });
        }

        const escrowTxn = await Transaction.findOne({
            order: order._id,
            status: 'hold',
        });

        if (escrowTxn) {
            const platformFee = escrowTxn.amount * 0.10;
            const artisanPayout = escrowTxn.amount - platformFee;

            escrowTxn.status = 'completed';
            escrowTxn.platform_fee = platformFee;
            escrowTxn.description = `Escrow released. Artisan payout: ${artisanPayout}`;
            await escrowTxn.save();

            order.order_status = 'delivered';
            order.payment_status = 'completed';
            order.delivery_otp = undefined;
        } else {
            order.order_status = 'delivered';
            order.delivery_otp = undefined;
        }

        await order.save();

        // Track order completion in analytics (fire-and-forget)
        trackOrderCompletion(order._id, order.artisan, order.total_amount).catch(err =>
            console.error('[Analytics] trackOrderCompletion error:', err)
        );

        // Trigger payment release (handled in PaymentController)

        res.status(200).json({
            success: true,
            message: 'Delivery verified successfully.',
            data: { order },
        });
    } catch (error) {
        console.error('Verify delivery error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify delivery.',
            error: error.message,
        });
    }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const view = typeof req.query.view === 'string' ? req.query.view : '';

        let query;
        if (req.user.role === 'consumer' || req.user.role === 'trader') {
            query = { consumer: req.user._id };
        } else if (req.user.role === 'artisan') {
            // Artisans can view orders in two modes:
            // - purchases: orders they placed as buyer (consumer field)
            // - default: orders they need to fulfill (artisan field)
            query = view === 'purchases'
                ? { consumer: req.user._id }
                : { artisan: req.user._id };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid user role for orders.',
            });
        }

        const orders = await Order.find(query)
            .populate('consumer', 'name')
            .populate('artisan', 'name')
            .populate('items.product', 'name price')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders.',
            error: error.message,
        });
    }
};

// @desc    Create B2B material orders (batch with delivery address)
// @route   POST /api/b2b/orders
// @access  Private (trader only)
export const createB2BOrder = async (req, res) => {
    try {
        const { items, delivery_address, payment_method, notes } = req.body;

        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order items are required.',
            });
        }

        if (!delivery_address || !delivery_address.street || !delivery_address.city || !delivery_address.state || !delivery_address.zip) {
            return res.status(400).json({
                success: false,
                message: 'Complete delivery address is required.',
            });
        }

        // Validate all items
        const validatedItems = [];
        const failedItems = [];

        for (const item of items) {
            const seller_id = item.seller_id;
            const { material_id, quantity, unit_price } = item;

            if (!seller_id || !material_id || !quantity || !unit_price) {
                failedItems.push({
                    materialId: material_id,
                    message: 'Missing required fields.',
                });
                continue;
            }

            if (!mongoose.Types.ObjectId.isValid(seller_id) || !mongoose.Types.ObjectId.isValid(material_id)) {
                failedItems.push({
                    materialId: material_id,
                    message: 'Invalid ID format.',
                });
                continue;
            }

            // Verify material exists and is available
            const material = await RawMaterial.findById(material_id);
            if (!material) {
                failedItems.push({
                    materialId: material_id,
                    message: 'Material not found.',
                });
                continue;
            }

            if (material.availability === false) {
                failedItems.push({
                    materialId: material_id,
                    message: `${material.name} is unavailable.`,
                });
                continue;
            }

            // Verify seller matches material owner
            if (material.seller.toString() !== seller_id) {
                failedItems.push({
                    materialId: material_id,
                    message: 'Seller mismatch.',
                });
                continue;
            }

            // Enforce stock limit when stock is tracked (> 0)
            if (material.stock_quantity > 0 && quantity > material.stock_quantity) {
                failedItems.push({
                    materialId: material_id,
                    message: `Insufficient stock for ${material.name}. Requested ${quantity}, available ${material.stock_quantity}.`,
                });
                continue;
            }

            // Prevent buyers from ordering their own listed material
            if (material.seller.toString() === req.user._id.toString()) {
                failedItems.push({
                    materialId: material_id,
                    message: `You cannot order your own material: ${material.name}.`,
                });
                continue;
            }

            validatedItems.push({
                seller_id,
                material_id,
                material_name: material.name,
                category: material.category,
                quantity,
                unit: item.unit || material.unit || 'unit',
                unit_price,
                total_price: unit_price * quantity,
                tracks_stock: material.stock_quantity > 0,
            });
        }

        if (validatedItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid items to order.',
                data: { failedItems },
            });
        }

        // Group by seller
        const groupedBySeller = new Map();
        for (const item of validatedItems) {
            if (!groupedBySeller.has(item.seller_id)) {
                groupedBySeller.set(item.seller_id, []);
            }
            groupedBySeller.get(item.seller_id).push(item);
        }

        // Create orders
        const createdOrders = [];
        for (const [sellerId, sellerItems] of groupedBySeller.entries()) {
            for (const item of sellerItems) {
                let decrementedStock = false;
                const b2bOrder = new B2BOrder({
                    trader: req.user._id,
                    seller: item.seller_id,
                    material: item.material_id,
                    material_name: item.material_name,
                    quantity: item.quantity,
                    unit: item.unit,
                    unit_price: item.unit_price,
                    total_price: item.total_price,
                    delivery_address: {
                        street: delivery_address.street,
                        city: delivery_address.city,
                        state: delivery_address.state,
                        zip: delivery_address.zip,
                        full_address: `${delivery_address.street}, ${delivery_address.city}, ${delivery_address.state} - ${delivery_address.zip}`,
                    },
                    payment_method: payment_method || 'pending',
                    notes: notes || '',
                    status: 'pending',
                    payment_status: 'pending',
                });

                try {
                    // Atomic stock decrement to prevent overselling in concurrent requests
                    if (item.tracks_stock) {
                        const updatedMaterial = await RawMaterial.findOneAndUpdate(
                            {
                                _id: item.material_id,
                                seller: item.seller_id,
                                availability: { $ne: false },
                                stock_quantity: { $gte: item.quantity },
                            },
                            {
                                $inc: { stock_quantity: -item.quantity },
                            },
                            { returnDocument: 'after' }
                        );

                        if (!updatedMaterial) {
                            failedItems.push({
                                materialId: item.material_id,
                                message: `Insufficient stock for ${item.material_name}.`,
                            });
                            continue;
                        }

                        decrementedStock = true;

                        // Auto-mark unavailable when stock hits zero
                        if (updatedMaterial.stock_quantity <= 0 && updatedMaterial.availability !== false) {
                            await RawMaterial.updateOne(
                                { _id: updatedMaterial._id },
                                { $set: { availability: false } }
                            );
                        }
                    }

                    await b2bOrder.save();
                    createdOrders.push(b2bOrder._id);
                } catch (saveError) {
                    // Best-effort rollback of stock if order save fails after decrement
                    if (decrementedStock) {
                        await RawMaterial.updateOne(
                            { _id: item.material_id },
                            { $inc: { stock_quantity: item.quantity } }
                        );
                    }
                    failedItems.push({
                        materialId: item.material_id,
                        message: `Failed to place order for ${item.material_name}.`,
                    });
                }
            }
        }

        res.status(201).json({
            success: true,
            message: `${createdOrders.length} B2B order(s) placed successfully.`,
            data: {
                orderCount: createdOrders.length,
                orderIds: createdOrders,
                failedItems,
            },
        });
    } catch (error) {
        console.error('Create B2B order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to place B2B order.',
            error: error.message,
        });
    }
};

// @desc    Get B2B orders for trader and artisan
// @route   GET /api/b2b/orders
// @access  Private (trader or artisan)
export const getB2BOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query;
        if (req.user.role === 'trader') {
            // Trader can be a buyer (trader field) and also material seller (seller field)
            query = { $or: [{ trader: req.user._id }, { seller: req.user._id }] };
        } else if (req.user.role === 'artisan') {
            // Artisan can receive bulk product orders and can also be buyer for material orders
            query = { $or: [{ artisan: req.user._id }, { trader: req.user._id }] };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid user role for B2B orders.',
            });
        }

        if (status) {
            query.status = status;
        }

        const orders = await B2BOrder.find(query)
            .populate('trader', 'name email')
            .populate('seller', 'name email')
            .populate('artisan', 'name email')
            .populate('material', 'name category')
            .populate('product', 'name category')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const normalizedOrders = orders.map((order) => {
            const doc = order.toObject();
            return {
                ...doc,
                seller: doc.seller || null,
            };
        });

        const total = await B2BOrder.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                orders: normalizedOrders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get B2B orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch B2B orders.',
            error: error.message,
        });
    }
};

// @desc    Get B2B order by ID
// @route   GET /api/b2b/orders/:id
// @access  Private (trader or artisan only)
export const getB2BOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format.',
            });
        }

        const order = await B2BOrder.findById(id)
            .populate('trader', 'name email phone_number profile_picture')
            .populate('seller', 'name email phone_number profile_picture')
            .populate('artisan', 'name email phone_number profile_picture')
            .populate('material', 'name category unit');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'B2B order not found.',
            });
        }

        const isTrader = order.trader && req.user._id.toString() === order.trader._id.toString();
        const isMaterialSeller = order.seller && req.user._id.toString() === order.seller._id.toString();
        const isArtisanSeller = order.artisan && req.user._id.toString() === order.artisan._id.toString();

        // Authorization: buyer trader or seller side (material seller/artisan)
        if (!isTrader && !isMaterialSeller && !isArtisanSeller) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order.',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                order: {
                    ...order.toObject(),
                    seller: order.seller || null,
                },
            },
        });
    } catch (error) {
        console.error('Get B2B order by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch B2B order.',
            error: error.message,
        });
    }
};

// @desc    Update B2B order status
// @route   PUT /api/b2b/orders/:id/status
// @access  Private (seller side: trader material seller / artisan bulk seller)
export const updateB2BOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID format.',
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required.',
            });
        }

        const VALID_STATUSES = ['pending', 'accepted', 'processing', 'shipped', 'delivered', 'rejected', 'cancelled'];
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
            });
        }

        const order = await B2BOrder.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'B2B order not found.',
            });
        }

        const isMaterialSeller = order.seller && req.user._id.toString() === order.seller.toString();
        const isArtisanSeller = order.artisan && req.user._id.toString() === order.artisan.toString();

        // Authorization: only seller side (or admin)
        if (req.user.role !== 'admin' && !isMaterialSeller && !isArtisanSeller) {
            return res.status(403).json({
                success: false,
                message: 'Only the seller can update this order status.',
            });
        }

        // Validate status transitions
        const VALID_TRANSITIONS = {
            pending: ['accepted', 'rejected', 'cancelled'],
            accepted: ['processing', 'rejected', 'cancelled'],
            processing: ['shipped', 'cancelled'],
            shipped: ['delivered', 'cancelled'],
            delivered: [],
            rejected: [],
            cancelled: [],
        };

        if (!VALID_TRANSITIONS[order.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot transition from '${order.status}' to '${status}'.`,
                validTransitions: VALID_TRANSITIONS[order.status],
            });
        }

        order.status = status;
        await order.save();

        // Populate after save for response
        await order.populate('trader', 'name email phone_number profile_picture');
        await order.populate('seller', 'name email phone_number profile_picture');
        await order.populate('artisan', 'name email phone_number profile_picture');
        await order.populate('material', 'name category unit');

        res.status(200).json({
            success: true,
            message: `Order status updated to '${status}'.`,
            data: { order },
        });
    } catch (error) {
        console.error('Update B2B order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update B2B order status.',
            error: error.message,
        });
    }
};
