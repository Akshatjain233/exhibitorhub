import request from 'supertest';
import app from '../../server.js';
import { createTestUser, generateToken, authHeaders } from '../fixtures/helpers.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import bcrypt from 'bcryptjs';

describe('Order Controller', () => {
    let artisan, artisanToken, consumer, consumerToken, product;

    beforeEach(async () => {
        // Create artisan and product
        const artisanResult = await createTestUser('artisan');
        artisan = artisanResult.user;
        artisanToken = generateToken(artisan._id);

        product = await Product.create({
            artisan: artisan._id,
            name: 'Handmade Pot',
            price: 500,
            availability: true,
        });

        // Create consumer
        const consumerResult = await createTestUser('consumer');
        consumer = consumerResult.user;
        consumerToken = generateToken(consumer._id);
    });

    describe('POST /api/orders', () => {
        it('should create order successfully', async () => {
            const orderData = {
                items: [
                    {
                        product: product._id,
                        quantity: 2,
                    },
                ],
                delivery_address: {
                    street: '123 Main St',
                    city: 'Delhi',
                    state: 'Delhi',
                    pincode: '110001',
                },
            };

            const response = await request(app)
                .post('/api/orders')
                .set(authHeaders(consumerToken))
                .send(orderData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.order).toHaveProperty('total_amount', 1000); // 500 * 2
            expect(response.body.data.order.items).toHaveLength(1);
            expect(response.body.data.order.status).toBe('Pending');

            // OTP must not be leaked in API response
            expect(response.body.data).not.toHaveProperty('delivery_otp');
        });

        it('should fail with unavailable product', async () => {
            await Product.findByIdAndUpdate(product._id, { availability: false });

            const response = await request(app)
                .post('/api/orders')
                .set(authHeaders(consumerToken))
                .send({
                    items: [{ product: product._id, quantity: 1 }],
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/not available/i);
        });

        it('should create split orders for products from different artisans', async () => {
            const anotherArtisan = await createTestUser('artisan', { email: 'artisan2@test.com' });
            const product2 = await Product.create({
                artisan: anotherArtisan.user._id,
                name: 'Another Product',
                price: 300,
                availability: true,
            });

            const response = await request(app)
                .post('/api/orders')
                .set(authHeaders(consumerToken))
                .send({
                    items: [
                        { product: product._id, quantity: 1 },
                        { product: product2._id, quantity: 1 },
                    ],
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.orders).toHaveLength(2);
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/orders')
                .send({ items: [{ product: product._id, quantity: 1 }] });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/orders/:orderId', () => {
        it('should get order details (consumer)', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: product._id, quantity: 1, price_at_purchase: 500 }],
                total_amount: 500,
                delivery_otp_hash: await bcrypt.hash('123456', 10),
                status: 'Pending',
            });

            const response = await request(app)
                .get(`/api/orders/${order._id}`)
                .set(authHeaders(consumerToken));

            expect(response.status).toBe(200);
            expect(response.body.data.order._id.toString()).toBe(order._id.toString());
        });

        it('should get order details (artisan)', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: product._id, quantity: 1, price_at_purchase: 500 }],
                total_amount: 500,
                delivery_otp_hash: await bcrypt.hash('123456', 10),
                status: 'Pending',
            });

            const response = await request(app)
                .get(`/api/orders/${order._id}`)
                .set(authHeaders(artisanToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should fail for unauthorized user', async () => {
            const otherConsumer = await createTestUser('consumer', { email: 'other@test.com' });
            const otherToken = generateToken(otherConsumer.user._id);

            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: product._id, quantity: 1, price_at_purchase: 500 }],
                total_amount: 500,
                delivery_otp_hash: await bcrypt.hash('123456', 10),
            });

            const response = await request(app)
                .get(`/api/orders/${order._id}`)
                .set(authHeaders(otherToken));

            expect(response.status).toBe(403);
        });
    });

    describe('PUT /api/orders/:orderId/status', () => {
        it('should update order status (artisan)', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: product._id, quantity: 1, price_at_purchase: 500 }],
                total_amount: 500,
                delivery_otp_hash: await bcrypt.hash('123456', 10),
                status: 'Pending',
            });

            const response = await request(app)
                .put(`/api/orders/${order._id}/status`)
                .set(authHeaders(artisanToken))
                .send({ status: 'Shipped' });

            expect(response.status).toBe(200);
            expect(response.body.data.order.status).toBe('Shipped');
        });

        it('should fail with invalid status', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: product._id, quantity: 1, price_at_purchase: 500 }],
                total_amount: 500,
                delivery_otp_hash: await bcrypt.hash('123456', 10),
            });

            const response = await request(app)
                .put(`/api/orders/${order._id}/status`)
                .set(authHeaders(artisanToken))
                .send({ status: 'InvalidStatus' });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/orders/:orderId/verify-delivery', () => {
        it('should verify delivery with correct OTP', async () => {
            const otp = '123456';
            const otpHash = await bcrypt.hash(otp, 10);

            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: product._id, quantity: 1, price_at_purchase: 500 }],
                total_amount: 500,
                delivery_otp_hash: otpHash,
                status: 'Shipped',
            });

            const response = await request(app)
                .post(`/api/orders/${order._id}/verify-delivery`)
                .set(authHeaders(consumerToken))
                .send({ otp });

            expect(response.status).toBe(200);
            expect(['Delivered', 'Completed']).toContain(response.body.data.order.status);
        });

        it('should fail with incorrect OTP', async () => {
            const otpHash = await bcrypt.hash('123456', 10);

            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: product._id, quantity: 1, price_at_purchase: 500 }],
                total_amount: 500,
                delivery_otp_hash: otpHash,
                status: 'Shipped',
            });

            const response = await request(app)
                .post(`/api/orders/${order._id}/verify-delivery`)
                .set(authHeaders(consumerToken))
                .send({ otp: '999999' });

            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/invalid otp/i);
        });
    });

    describe('GET /api/orders/my-orders', () => {
        beforeEach(async () => {
            // Create multiple orders
            await Order.create([
                {
                    consumer: consumer._id,
                    artisan: artisan._id,
                    items: [{ product: product._id, quantity: 1, price_at_purchase: 500 }],
                    total_amount: 500,
                    delivery_otp_hash: await bcrypt.hash('123456', 10),
                    status: 'Pending',
                },
                {
                    consumer: consumer._id,
                    artisan: artisan._id,
                    items: [{ product: product._id, quantity: 2, price_at_purchase: 500 }],
                    total_amount: 1000,
                    delivery_otp_hash: await bcrypt.hash('123456', 10),
                    status: 'Completed',
                },
            ]);
        });

        it('should get consumer orders', async () => {
            const response = await request(app)
                .get('/api/orders/my-orders')
                .set(authHeaders(consumerToken));

            expect(response.status).toBe(200);
            expect(response.body.data.orders).toHaveLength(2);
            expect(response.body.data.pagination.total).toBe(2);
        });

        it('should get artisan orders', async () => {
            const response = await request(app)
                .get('/api/orders/my-orders')
                .set(authHeaders(artisanToken));

            expect(response.status).toBe(200);
            expect(response.body.data.orders).toHaveLength(2);
        });
    });
});
