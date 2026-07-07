import mongoose from 'mongoose';
import 'dotenv/config';
import Order from './models/Order.js';
import User from './models/User.js';
import ArtisanProfile from './models/ArtisanProfile.js';

async function testAnalyticsData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sutragam');
        console.log('✅ Connected to MongoDB');

        // Find an artisan user
        const artisan = await User.findOne({ role: 'artisan' });
        if (!artisan) {
            console.log('❌ No artisan found in database');
            process.exit(0);
        }
        console.log('✅ Found artisan:', artisan.name, 'ID:', artisan._id);

        // Get artisan profile
        const profile = await ArtisanProfile.findOne({ user: artisan._id });
        console.log('✅ Artisan Profile:', {
            total_views: profile?.total_views || 0,
            total_likes: profile?.total_likes || 0,
            rating: profile?.rating_avg || 0,
        });

        // Find all orders for this artisan
        const orders = await Order.find({ artisan: artisan._id });
        console.log('\n📦 ORDERS ANALYSIS:');
        console.log('Total Orders:', orders.length);

        if (orders.length === 0) {
            console.log('❌ No orders found for this artisan');
            console.log('\n💡 Creating a test order...');
            
            // Find or create a consumer
            let consumer = await User.findOne({ role: 'consumer' });
            if (!consumer) {
                consumer = await User.create({
                    name: 'Test Consumer',
                    phone_number: '+919999999999',
                    role: 'consumer',
                    preferred_language: 'english',
                    is_active: true,
                });
                console.log('✅ Created test consumer:', consumer._id);
            }

            // Create a test completed order
            const testOrder = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{
                    quantity: 2,
                    price: 2500,
                    price_at_purchase: 2500,
                }],
                subtotal: 5000,
                delivery_charges: 100,
                total_amount: 5100,
                payment_status: 'paid',
                order_status: 'delivered',
            });
            console.log('✅ Created test order:', testOrder._id, 'Amount: ₹', testOrder.total_amount);
            
            // Refresh orders list
            const updatedOrders = await Order.find({ artisan: artisan._id });
            console.log('✅ Total orders now:', updatedOrders.length);
        } else {
            // Analyze existing orders
            orders.forEach((order, index) => {
                console.log(`\nOrder ${index + 1}:`, {
                    _id: order._id,
                    order_status: order.order_status,
                    payment_status: order.payment_status,
                    total_amount: order.total_amount,
                    subtotal: order.subtotal,
                    items: order.items?.length || 0,
                    createdAt: order.createdAt,
                });
            });

            // Calculate revenue
            const completedOrders = orders.filter(o => {
                const isDelivered = o.order_status === 'delivered';
                const isPaid = o.payment_status === 'completed' || o.payment_status === 'paid';
                return isDelivered && isPaid;
            });

            const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

            console.log('\n💰 REVENUE ANALYSIS:');
            console.log('Completed & Paid Orders:', completedOrders.length);
            console.log('Total Revenue: ₹', totalRevenue);
            console.log('Average Order Value: ₹', completedOrders.length > 0 ? (totalRevenue / completedOrders.length).toFixed(2) : 0);
        }

        console.log('\n✅ Test complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testAnalyticsData();
