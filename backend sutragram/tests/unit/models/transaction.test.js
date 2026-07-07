import { jest, describe, test, expect, beforeAll, beforeEach, afterAll, afterEach } from '@jest/globals';
import Transaction from '../../../models/Transaction.js';
import { createTestUser } from '../../fixtures/helpers.js';

describe('Transaction Model - Exhaustive Tests', () => {
    let user, relatedUser;

    beforeAll(async () => {
        const userResult = await createTestUser('consumer');
        const artisanResult = await createTestUser('artisan');
        user = userResult.user;
        relatedUser = artisanResult.user;
    });

    describe('Schema Validation', () => {
        test('should create transaction with required fields', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'Inbound',
                amount: 1000,
                status: 'completed',
            });

            expect(transaction.user.toString()).toBe(user._id.toString());
            expect(transaction.amount).toBe(1000);
            expect(transaction.type).toBe('Inbound');
        });

        test('should fail when user is missing', async () => {
            await expect(
                Transaction.create({
                    type: 'Inbound',
                    amount: 1000,
                    status: 'completed',
                })
            ).rejects.toThrow();
        });

        test('should fail when type is missing', async () => {
            await expect(
                Transaction.create({
                    user: user._id,
                    amount: 1000,
                    status: 'completed',
                })
            ).rejects.toThrow();
        });

        test('should fail when amount is missing', async () => {
            await expect(
                Transaction.create({
                    user: user._id,
                    type: 'Inbound',
                    status: 'completed',
                })
            ).rejects.toThrow();
        });

        test('should accept all valid transaction types', async () => {
            const types = [
                'Inbound',
                'Outbound',
                'Refund',
                'workshop_payment',
                'workshop_payout',
                'workshop_refund',
                'platform_fee',
            ];

            for (const type of types) {
                const transaction = await Transaction.create({
                    user: user._id,
                    type,
                    amount: 100,
                    status: 'completed',
                });

                expect(transaction.type).toBe(type);
            }
        });

        test('should reject invalid transaction type', async () => {
            await expect(
                Transaction.create({
                    user: user._id,
                    type: 'invalid_type',
                    amount: 100,
                    status: 'completed',
                })
            ).rejects.toThrow();
        });

        test('should accept all valid status values', async () => {
            const statuses = ['pending', 'completed', 'failed', 'hold'];

            for (const status of statuses) {
                const transaction = await Transaction.create({
                    user: user._id,
                    type: 'Inbound',
                    amount: 100,
                    status,
                });

                expect(transaction.status).toBe(status);
            }
        });

        test('should reject invalid status', async () => {
            await expect(
                Transaction.create({
                    user: user._id,
                    type: 'Inbound',
                    amount: 100,
                    status: 'processing',
                })
            ).rejects.toThrow();
        });

        test('should set default status to completed', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'Inbound',
                amount: 100,
            });

            expect(transaction.status).toBe('completed');
        });

        test('should store related_user when provided', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                related_user: relatedUser._id,
                type: 'workshop_payout',
                amount: 900,
                status: 'completed',
            });

            expect(transaction.related_user.toString()).toBe(relatedUser._id.toString());
        });

        test('should store platform_fee when provided', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'platform_fee',
                amount: 100,
                platform_fee: 100,
                status: 'completed',
            });

            expect(transaction.platform_fee).toBe(100);
        });

        test('should store description when provided', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'workshop_payment',
                amount: 1000,
                status: 'hold',
                description: 'Workshop: Pottery Basics',
            });

            expect(transaction.description).toBe('Workshop: Pottery Basics');
        });

        test('should allow order reference to be null', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'Inbound',
                amount: 500,
                status: 'completed',
                order: null,
            });

            expect(transaction.order).toBeNull();
        });
    });

    describe('Workshop Settlement Transactions', () => {
        test('should create workshop_payment transaction', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                related_user: relatedUser._id,
                type: 'workshop_payment',
                amount: 1000,
                status: 'hold',
                description: 'Payment for workshop',
            });

            expect(transaction.type).toBe('workshop_payment');
            expect(transaction.status).toBe('hold');
        });

        test('should create workshop_payout transaction with platform fee', async () => {
            const transaction = await Transaction.create({
                user: relatedUser._id,
                related_user: user._id,
                type: 'workshop_payout',
                amount: 900,
                platform_fee: 100,
                status: 'completed',
                description: 'Payout for workshop attendance',
            });

            expect(transaction.amount).toBe(900);
            expect(transaction.platform_fee).toBe(100);
        });

        test('should create workshop_refund transaction', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'workshop_refund',
                amount: 900,
                status: 'completed',
                description: 'Refund for no-show',
            });

            expect(transaction.type).toBe('workshop_refund');
            expect(transaction.amount).toBe(900);
        });

        test('should create platform_fee transaction', async () => {
            const transaction = await Transaction.create({
                user: relatedUser._id,
                type: 'platform_fee',
                amount: 100,
                status: 'completed',
                description: 'Platform fee (10%)',
            });

            expect(transaction.type).toBe('platform_fee');
        });
    });

    describe('Edge Cases', () => {
        test('should handle zero amount', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'Inbound',
                amount: 0,
                status: 'completed',
            });

            expect(transaction.amount).toBe(0);
        });

        test('should handle negative amount', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'Refund',
                amount: -500,
                status: 'completed',
            });

            expect(transaction.amount).toBe(-500);
        });

        test('should handle very large amounts', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'Inbound',
                amount: 1000000,
                status: 'completed',
            });

            expect(transaction.amount).toBe(1000000);
        });

        test('should handle decimal amounts', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'Inbound',
                amount: 999.99,
                status: 'completed',
            });

            expect(transaction.amount).toBe(999.99);
        });

        test('should handle very long description', async () => {
            const longDesc = 'A'.repeat(1000);

            const transaction = await Transaction.create({
                user: user._id,
                type: 'Inbound',
                amount: 100,
                status: 'completed',
                description: longDesc,
            });

            expect(transaction.description).toBe(longDesc);
        });

        test('should handle unicode in description', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'workshop_payment',
                amount: 1000,
                status: 'hold',
                description: 'कार्यशाला भुगतान - मिट्टी के बर्तन',
            });

            expect(transaction.description).toContain('मिट्टी');
        });
    });

    describe('Indexes', () => {
        test('should have index on user', async () => {
            const indexes = Transaction.schema.indexes();
            const userIndex = indexes.find((idx) => idx[0].user);

            expect(userIndex).toBeDefined();
        });

        test('should have index on related_user', async () => {
            const indexes = Transaction.schema.indexes();
            const relatedUserIndex = indexes.find((idx) => idx[0].related_user);

            expect(relatedUserIndex).toBeDefined();
        });

        test('should have index on type', async () => {
            const indexes = Transaction.schema.indexes();
            const typeIndex = indexes.find((idx) => idx[0].type);

            expect(typeIndex).toBeDefined();
        });

        test('should have index on status', async () => {
            const indexes = Transaction.schema.indexes();
            const statusIndex = indexes.find((idx) => idx[0].status);

            expect(statusIndex).toBeDefined();
        });
    });

    describe('Timestamps', () => {
        test('should auto-generate createdAt', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'Inbound',
                amount: 100,
                status: 'completed',
            });

            expect(transaction.createdAt).toBeInstanceOf(Date);
        });

        test('should auto-generate updatedAt', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'Inbound',
                amount: 100,
                status: 'pending',
            });

            const originalUpdatedAt = transaction.updatedAt;

            await new Promise((resolve) => setTimeout(resolve, 100));

            transaction.status = 'completed';
            await transaction.save();

            expect(transaction.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        });

        test('should store processed_at when transaction is processed', async () => {
            const transaction = await Transaction.create({
                user: user._id,
                type: 'Inbound',
                amount: 100,
                status: 'completed',
                processed_at: new Date(),
            });

            expect(transaction.processed_at).toBeInstanceOf(Date);
        });
    });
});
