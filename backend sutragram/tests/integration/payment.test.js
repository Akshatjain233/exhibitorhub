import request from 'supertest';
import app from '../../server.js';
import { createTestUser, generateToken, authHeaders } from '../fixtures/helpers.js';
import Order from '../../models/Order.js';
import Transaction from '../../models/Transaction.js';
import Product from '../../models/Product.js';

describe('Payment Controller', () => {
    let artisan, consumer, consumerToken, order, product;

    beforeEach(async () => {
        const artisanResult = await createTestUser('artisan');
        artisan = artisanResult.user;

        const consumerResult = await createTestUser('consumer');
        consumer = consumerResult.user;
        consumerToken = generateToken(consumer._id);

        product = await Product.create({
            artisan: artisan._id,
            name: 'Test Product',
            price: 1000,
            availability: true,
        });

        order = await Order.create({
            consumer: consumer._id,
            artisan: artisan._id,
            items: [{ product: product._id, quantity: 1, price_at_purchase: 1000 }],
            total_amount: 1000,
            status: 'Pending',
        });
    });

    describe('POST /api/payments/process', () => {
        it('should process payment and hold in escrow', async () => {
            const response = await request(app)
                .post('/api/payments/process')
                .set(authHeaders(consumerToken))
                .send({
                    order_id: order._id,
                    payment_method: 'UPI',
                    upi_id: 'test@upi',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.transaction.status).toBe('Escrow_Held');
            expect(response.body.data.transaction.amount).toBe(1000);

            // Verify order status updated
            const updatedOrder = await Order.findById(order._id);
            expect(updatedOrder.status).toBe('Escrow_Held');
        });

        it('should fail without payment method', async () => {
            const response = await request(app)
                .post('/api/payments/process')
                .set(authHeaders(consumerToken))
                .send({ order_id: order._id });

            expect(response.status).toBe(400);
        });

        it('should fail for non-existent order', async () => {
            const fakeOrderId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .post('/api/payments/process')
                .set(authHeaders(consumerToken))
                .send({
                    order_id: fakeOrderId,
                    payment_method: 'UPI',
                });

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/payments/release/:orderId', () => {
        beforeEach(async () => {
            // Create transaction in escrow
            await Transaction.create({
                order: order._id,
                consumer: consumer._id,
                artisan: artisan._id,
                amount: 1000,
                payment_method: 'UPI',
                transaction_type: 'Order',
                status: 'Escrow_Held',
            });

            // Update order to delivered
            await Order.findByIdAndUpdate(order._id, { status: 'Delivered' });
        });

        it('should release payment with 10% platform fee', async () => {
            const response = await request(app)
                .post(`/api/payments/release/${order._id}`)
                .set(authHeaders(consumerToken));

            expect(response.status).toBe(200);
            expect(response.body.data.platform_fee).toBe(100); // 10% of 1000
            expect(response.body.data.artisan_payout).toBe(900); // 90% of 1000
            expect(response.body.data.transaction.status).toBe('Completed');

            // Verify order completed
            const completedOrder = await Order.findById(order._id);
            expect(completedOrder.status).toBe('Completed');
        });

        it('should fail if order not delivered', async () => {
            await Order.findByIdAndUpdate(order._id, { status: 'Pending' });

            const response = await request(app)
                .post(`/api/payments/release/${order._id}`)
                .set(authHeaders(consumerToken));

            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/delivered/i);
        });
    });

    describe('GET /api/payments/transactions', () => {
        beforeEach(async () => {
            await Transaction.create([
                {
                    order: order._id,
                    consumer: consumer._id,
                    artisan: artisan._id,
                    amount: 1000,
                    payment_method: 'UPI',
                    transaction_type: 'Order',
                    status: 'Completed',
                    platform_fee_amount: 100,
                    payout_amount: 900,
                },
                {
                    order: order._id,
                    consumer: consumer._id,
                    artisan: artisan._id,
                    amount: 500,
                    payment_method: 'UPI',
                    transaction_type: 'Order',
                    status: 'Escrow_Held',
                },
            ]);
        });

        it('should get consumer transactions', async () => {
            const response = await request(app)
                .get('/api/payments/transactions')
                .set(authHeaders(consumerToken));

            expect(response.status).toBe(200);
            expect(response.body.data.transactions).toHaveLength(2);
        });

        it('should fail without authentication', async () => {
            const response = await request(app).get('/api/payments/transactions');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/payments/dispute/:orderId', () => {
        it('should create dispute', async () => {
            const response = await request(app)
                .post(`/api/payments/dispute/${order._id}`)
                .set(authHeaders(consumerToken))
                .send({
                    reason: 'Product damaged',
                    description: 'The product arrived damaged',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify order status
            const disputedOrder = await Order.findById(order._id);
            expect(disputedOrder.status).toBe('Dispute');
        });

        it('should fail for unauthorized user', async () => {
            const otherUser = await createTestUser('consumer', { email: 'other@test.com' });
            const otherToken = generateToken(otherUser.user._id);

            const response = await request(app)
                .post(`/api/payments/dispute/${order._id}`)
                .set(authHeaders(otherToken))
                .send({ reason: 'Test' });

            expect(response.status).toBe(403);
        });
    });
});
