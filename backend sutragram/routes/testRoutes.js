import express from 'express';
import { authenticate, authorize } from '../middlewares/userAuth.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// @desc    Create test order data for artisan
// @route   POST /api/v1/test/create-order
// @access  Private (artisan only)
router.post('/create-order', authenticate, authorize('artisan'), async (req, res) => {
    try {
        const artisanId = req.user._id;
        
        // Find or create a test consumer
        let consumer = await User.findOne({ role: 'consumer' });
        if (!consumer) {
            consumer = await User.create({
                name: 'Test Consumer',
                phone_number: '+919999999998',
                role: 'consumer',
                preferred_language: 'english',
                is_active: true,
            });
        }

        // Create test order with random amount
        const testAmount = Math.floor(Math.random() * 5000) + 1000; // Random amount between 1000-6000
        const deliveryCharges = 100;
        
        const newOrder = await Order.create({
            consumer: consumer._id,
            artisan: artisanId,
            items: [{
                quantity: 1,
                price: testAmount,
                price_at_purchase: testAmount,
            }],
            subtotal: testAmount,
            delivery_charges: deliveryCharges,
            total_amount: testAmount + deliveryCharges,
            payment_status: 'paid',
            order_status: 'delivered',
        });

        res.status(201).json({
            success: true,
            message: 'Test order created successfully',
            data: {
                order_id: newOrder._id,
                total_amount: newOrder.total_amount,
                order_status: newOrder.order_status,
                payment_status: newOrder.payment_status,
            }
        });
    } catch (error) {
        console.error('Create test order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create test order',
            error: error.message
        });
    }
});

// @desc    Get all orders for current artisan (for debugging)
// @route   GET /api/v1/test/my-orders
// @access  Private (artisan only)
router.get('/my-orders', authenticate, authorize('artisan'), async (req, res) => {
    try {
        const orders = await Order.find({ artisan: req.user._id })
            .populate('consumer', 'name phone_number')
            .sort({ createdAt: -1 });

        const summary = {
            total: orders.length,
            completed: orders.filter(o => o.order_status === 'delivered' && 
                (o.payment_status === 'paid' || o.payment_status === 'completed')).length,
            revenue: orders
                .filter(o => o.order_status === 'delivered' && 
                    (o.payment_status === 'paid' || o.payment_status === 'completed'))
                .reduce((sum, o) => sum + (o.total_amount || 0), 0),
        };

        res.status(200).json({
            success: true,
            data: {
                orders,
                summary
            }
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
});

export default router;
