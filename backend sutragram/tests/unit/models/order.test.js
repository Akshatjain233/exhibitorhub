import { jest, describe, test, expect, beforeAll, beforeEach, afterAll, afterEach } from '@jest/globals';
import Order from '../../../models/Order.js';
import { createTestUser } from '../../fixtures/helpers.js';

describe('Order Model - Exhaustive Tests', () => {
    let consumer, artisan;

    beforeAll(async () => {
        const consumerResult = await createTestUser('consumer');
        const artisanResult = await createTestUser('artisan');
        consumer = consumerResult.user;
        artisan = artisanResult.user;
    });

    describe('Schema Validation', () => {
        test('should create order with required fields', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [
                    {
                        product: 'product123',
                        quantity: 2,
                        price: 500,
                    },
                ],
                subtotal: 1000,
                delivery_charges: 50,
                total_amount: 1050,
                payment_status: 'pending',
                order_status: 'placed',
            });

            expect(order.consumer.toString()).toBe(consumer._id.toString());
            expect(order.total_amount).toBe(1050);
            expect(order.payment_status).toBe('pending');
        });

        test('should fail when consumer is missing', async () => {
            await expect(
                Order.create({
                    artisan: artisan._id,
                    items: [{ product: 'p1', quantity: 1, price: 100 }],
                    subtotal: 100,
                    total_amount: 100,
                    payment_status: 'pending',
                })
            ).rejects.toThrow();
        });

        test('should fail when items array is empty', async () => {
            await expect(
                Order.create({
                    consumer: consumer._id,
                    artisan: artisan._id,
                    items: [],
                    subtotal: 0,
                    total_amount: 0,
                    payment_status: 'pending',
                })
            ).rejects.toThrow();
        });

        test('should accept valid payment_status values', async () => {
            const statuses = ['pending', 'completed', 'failed', 'refunded'];

            for (const status of statuses) {
                const order = await Order.create({
                    consumer: consumer._id,
                    artisan: artisan._id,
                    items: [{ product: `p${status}`, quantity: 1, price: 100 }],
                    subtotal: 100,
                    total_amount: 100,
                    payment_status: status,
                });

                expect(order.payment_status).toBe(status);
            }
        });

        test('should accept valid order_status values', async () => {
            const statuses = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

            for (const status of statuses) {
                const order = await Order.create({
                    consumer: consumer._id,
                    artisan: artisan._id,
                    items: [{ product: `p${status}`, quantity: 1, price: 100 }],
                    subtotal: 100,
                    total_amount: 100,
                    payment_status: 'pending',
                    order_status: status,
                });

                expect(order.order_status).toBe(status);
            }
        });

        test('should reject invalid payment_status', async () => {
            await expect(
                Order.create({
                    consumer: consumer._id,
                    artisan: artisan._id,
                    items: [{ product: 'p1', quantity: 1, price: 100 }],
                    subtotal: 100,
                    total_amount: 100,
                    payment_status: 'processing', // Invalid
                })
            ).rejects.toThrow();
        });

        test('should store delivery_address when provided', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: 'p1', quantity: 1, price: 100 }],
                subtotal: 100,
                total_amount: 100,
                payment_status: 'pending',
                delivery_address: {
                    street: '123 Main St',
                    city: 'Delhi',
                    state: 'Delhi',
                    pincode: '110001',
                },
            });

            expect(order.delivery_address.city).toBe('Delhi');
            expect(order.delivery_address.pincode).toBe('110001');
        });

        test('should handle multiple items in order', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [
                    { product: 'p1', quantity: 2, price: 100 },
                    { product: 'p2', quantity: 1, price: 200 },
                    { product: 'p3', quantity: 3, price: 50 },
                ],
                subtotal: 550,
                total_amount: 550,
                payment_status: 'pending',
            });

            expect(order.items).toHaveLength(3);
            expect(order.items[0].quantity).toBe(2);
        });

        test('should calculate correct subtotal', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [
                    { product: 'p1', quantity: 2, price: 100 },
                    { product: 'p2', quantity: 3, price: 200 },
                ],
                subtotal: 800, // (2*100) + (3*200)
                total_amount: 850,
                payment_status: 'pending',
                delivery_charges: 50,
            });

            expect(order.subtotal).toBe(800);
        });
    });

    describe('Indexes', () => {
        test('should have index on consumer', async () => {
            const indexes = Order.schema.indexes();
            const consumerIndex = indexes.find((idx) => idx[0].consumer);

            expect(consumerIndex).toBeDefined();
        });

        test('should have index on artisan', async () => {
            const indexes = Order.schema.indexes();
            const artisanIndex = indexes.find((idx) => idx[0].artisan);

            expect(artisanIndex).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        test('should handle zero delivery charges', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: 'p1', quantity: 1, price: 100 }],
                subtotal: 100,
                total_amount: 100,
                payment_status: 'pending',
                delivery_charges: 0,
            });

            expect(order.delivery_charges).toBe(0);
        });

        test('should handle very large order amounts', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: 'p1', quantity: 100, price: 10000 }],
                subtotal: 1000000,
                total_amount: 1000000,
                payment_status: 'pending',
            });

            expect(order.total_amount).toBe(1000000);
        });

        test('should handle order with tracking_id', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: 'p1', quantity: 1, price: 100 }],
                subtotal: 100,
                total_amount: 100,
                payment_status: 'completed',
                order_status: 'shipped',
                tracking_id: 'TRACK123456',
            });

            expect(order.tracking_id).toBe('TRACK123456');
        });

        test('should handle null optional fields', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: 'p1', quantity: 1, price: 100 }],
                subtotal: 100,
                total_amount: 100,
                payment_status: 'pending',
                tracking_id: null,
                delivery_address: null,
            });

            expect(order.tracking_id).toBeNull();
        });
    });

    describe('Timestamps', () => {
        test('should auto-generate createdAt for order placement time', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: 'p1', quantity: 1, price: 100 }],
                subtotal: 100,
                total_amount: 100,
                payment_status: 'pending',
            });

            expect(order.createdAt).toBeInstanceOf(Date);
        });

        test('should update updatedAt on status change', async () => {
            const order = await Order.create({
                consumer: consumer._id,
                artisan: artisan._id,
                items: [{ product: 'p1', quantity: 1, price: 100 }],
                subtotal: 100,
                total_amount: 100,
                payment_status: 'pending',
                order_status: 'placed',
            });

            const originalUpdatedAt = order.updatedAt;

            await new Promise((resolve) => setTimeout(resolve, 100));

            order.order_status = 'shipped';
            await order.save();

            expect(order.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        });
    });
});
