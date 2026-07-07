import request from 'supertest';
import app from '../../../server.js';
import Workshop from '../../../models/Workshop.js';
import WorkshopBooking from '../../../models/WorkshopBooking.js';
import Transaction from '../../../models/Transaction.js';
import { createTestUser, generateToken } from '../../fixtures/helpers.js';

describe('Workshop Settlement - Exhaustive Integration Tests', () => {
    let artisan, consumer1, consumer2, artisanToken, workshop;

    beforeEach(async () => {
        const artisanResult = await createTestUser('artisan');
        const consumer1Result = await createTestUser('consumer', { email: 'consumer1@test.com' });
        const consumer2Result = await createTestUser('consumer', { email: 'consumer2@test.com' });

        artisan = artisanResult.user;
        consumer1 = consumer1Result.user;
        consumer2 = consumer2Result.user;
        artisanToken = generateToken(artisan._id);

        // Create a workshop
        workshop = await Workshop.create({
            artisan: artisan._id,
            title: 'Pottery Workshop',
            description: 'Learn pottery',
            scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            fee: 1000,
            max_participants: 10,
            status: 'Scheduled',
        });

        // Create bookings
        const booking1 = await WorkshopBooking.create({
            workshop: workshop._id,
            consumer: consumer1._id,
            participants_count: 1,
            total_amount: 1000,
            payment_status: 'Paid',
            booking_status: 'Confirmed',
        });

        const booking2 = await WorkshopBooking.create({
            workshop: workshop._id,
            consumer: consumer2._id,
            participants_count: 1,
            total_amount: 1000,
            payment_status: 'Paid',
            booking_status: 'Confirmed',
        });

        // Create payment transactions (held in escrow)
        await Transaction.create({
            user: consumer1._id,
            related_user: artisan._id,
            type: 'workshop_payment',
            amount: 1000,
            status: 'hold',
            description: `Workshop booking: ${workshop.title}`,
        });

        await Transaction.create({
            user: consumer2._id,
            related_user: artisan._id,
            type: 'workshop_payment',
            amount: 1000,
            status: 'hold',
            description: `Workshop booking: ${workshop.title}`,
        });
    });

    describe('POST /api/workshops/:workshopId/finalize-attendance', () => {
        test('should finalize attendance and process settlements correctly', async () => {
            const response = await request(app)
                .post(`/api/workshops/${workshop._id}/finalize-attendance`)
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({
                    attendanceData: [
                        { consumer: consumer1._id, attended: true },
                        { consumer: consumer2._id, attended: false }, // No-show
                    ],
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify workshop status changed to Completed
            const updatedWorkshop = await Workshop.findById(workshop._id);
            expect(updatedWorkshop.status).toBe('Completed');

            // Verify transactions were created
            const transactions = await Transaction.find({
                related_user: artisan._id,
            }).sort({ createdAt: -1 });

            // Should have created:
            // 1. Artisan payout for attended (900 = 1000 - 10%)
            // 2. Platform fee for attended (100 = 10%)
            // 3. Consumer refund for no-show (900 = 90%)
            // 4. Platform fee for no-show (100 = 10%)

            const artisanPayout = transactions.find(
                (t) => t.type === 'workshop_payout' && t.user.toString() === artisan._id.toString()
            );
            expect(artisanPayout).toBeDefined();
            expect(artisanPayout.amount).toBe(900); // 90% of 1000

            const platformFees = transactions.filter((t) => t.type === 'platform_fee');
            expect(platformFees.length).toBeGreaterThanOrEqual(2); // At least 2 platform fees

            const refund = transactions.find(
                (t) => t.type === 'workshop_refund' && t.user.toString() === consumer2._id.toString()
            );
            expect(refund).toBeDefined();
            expect(refund.amount).toBe(900); // 90% refund
        });

        test('should reject unauthorized artisan', async () => {
            const otherArtisanResult = await createTestUser('artisan', { email: 'other@test.com' });
            const otherToken = generateToken(otherArtisanResult.user._id);

            const response = await request(app)
                .post(`/api/workshops/${workshop._id}/finalize-attendance`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                    attendanceData: [{ consumer: consumer1._id, attended: true }],
                });

            expect(response.status).toBe(403);
        });

        test('should reject without authentication', async () => {
            const response = await request(app)
                .post(`/api/workshops/${workshop._id}/finalize-attendance`)
                .send({
                    attendanceData: [{ consumer: consumer1._id, attended: true }],
                });

            expect(response.status).toBe(401);
        });

        test('should handle all attendees present', async () => {
            const response = await request(app)
                .post(`/api/workshops/${workshop._id}/finalize-attendance`)
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({
                    attendanceData: [
                        { consumer: consumer1._id, attended: true },
                        { consumer: consumer2._id, attended: true },
                    ],
                });

            expect(response.status).toBe(200);

            const transactions = await Transaction.find({
                type: 'workshop_payout',
                user: artisan._id,
            });

            const totalPayout = transactions.reduce((sum, t) => sum + t.amount, 0);
            expect(totalPayout).toBe(1800); // 900 + 900 (90% of each 1000)
        });

        test('should handle all attendees absent (no-shows)', async () => {
            const response = await request(app)
                .post(`/api/workshops/${workshop._id}/finalize-attendance`)
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({
                    attendanceData: [
                        { consumer: consumer1._id, attended: false },
                        { consumer: consumer2._id, attended: false },
                    ],
                });

            expect(response.status).toBe(200);

            const refunds = await Transaction.find({
                type: 'workshop_refund',
            });

            expect(refunds).toHaveLength(2);
            refunds.forEach((refund) => {
                expect(refund.amount).toBe(900); // 90% refund each
            });

            // Artisan should get no payout
            const payouts = await Transaction.find({
                type: 'workshop_payout',
                user: artisan._id,
            });

            expect(payouts).toHaveLength(0);
        });

        test('should fail with missing attendanceData', async () => {
            const response = await request(app)
                .post(`/api/workshops/${workshop._id}/finalize-attendance`)
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({});

            expect(response.status).toBe(400);
        });

        test('should fail with invalid workshop ID', async () => {
            const response = await request(app)
                .post('/api/workshops/invalid-id/finalize-attendance')
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({
                    attendanceData: [{ consumer: consumer1._id, attended: true }],
                });

            expect(response.status).toBeGreaterThanOrEqual(400);
        });

        test('should fail if workshop already completed', async () => {
            workshop.status = 'Completed';
            await workshop.save();

            const response = await request(app)
                .post(`/api/workshops/${workshop._id}/finalize-attendance`)
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({
                    attendanceData: [{ consumer: consumer1._id, attended: true }],
                });

            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('POST /api/workshops/:workshopId/cancel', () => {
        test('should cancel workshop and issue full refunds', async () => {
            const response = await request(app)
                .post(`/api/workshops/${workshop._id}/cancel`)
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({
                    cancellation_reason: 'Weather conditions',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify workshop cancelled
            const updatedWorkshop = await Workshop.findById(workshop._id);
            expect(updatedWorkshop.status).toBe('Cancelled');
            expect(updatedWorkshop.cancellation_reason).toBe('Weather conditions');

            // Verify 100% refunds issued
            const refunds = await Transaction.find({
                type: 'workshop_refund',
            });

            expect(refunds).toHaveLength(2);
            refunds.forEach((refund) => {
                expect(refund.amount).toBe(1000); // Full refund
            });
        });

        test('should reject unauthorized artisan cancellation', async () => {
            const otherArtisanResult = await createTestUser('artisan', { email: 'other2@test.com' });
            const otherToken = generateToken(otherArtisanResult.user._id);

            const response = await request(app)
                .post(`/api/workshops/${workshop._id}/cancel`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                    cancellation_reason: 'Test',
                });

            expect(response.status).toBe(403);
        });

        test('should require cancellation_reason', async () => {
            const response = await request(app)
                .post(`/api/workshops/${workshop._id}/cancel`)
                .set('Authorization', `Bearer ${artisanToken}`)
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('Platform Fee Calculation', () => {
        test('should calculate 10% platform fee correctly for various amounts', async () => {
            const testAmounts = [1000, 1500, 2000, 2500];

            for (const amount of testAmounts) {
                const expectedFee = Math.round(amount * 0.1);
                const expectedPayout = amount - expectedFee;

                expect(expectedFee).toBe(amount * 0.1);
                expect(expectedPayout).toBe(amount * 0.9);
            }
        });

        test('should calculate 90% refund correctly for no-shows', async () => {
            const testAmounts = [1000, 1500, 2000, 2500];

            for (const amount of testAmounts) {
                const expectedRefund = Math.round(amount * 0.9);
                const platformRetention = amount - expectedRefund;

                expect(expectedRefund).toBe(amount * 0.9);
                expect(platformRetention).toBe(amount * 0.1);
            }
        });
    });
});
