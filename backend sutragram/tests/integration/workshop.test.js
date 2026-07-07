import request from 'supertest';
import app from '../../server.js';
import { createTestUser, generateToken, authHeaders } from '../fixtures/helpers.js';
import Workshop from '../../models/Workshop.js';
import WorkshopBooking from '../../models/WorkshopBooking.js';
import Transaction from '../../models/Transaction.js';

describe('Workshop Settlement Integration Tests', () => {
    let artisan, artisanToken;
    let consumer1, consumer1Token;
    let consumer2, consumer2Token;
    let workshop;
    let booking1, booking2;

    beforeAll(async () => {
        // Create test users
        const artisanData = await createTestUser('artisan', { name: 'Test Artisan' });
        artisan = artisanData.user;
        artisanToken = generateToken(artisan._id);

        const consumer1Data = await createTestUser('consumer', { name: 'Consumer One' });
        consumer1 = consumer1Data.user;
        consumer1Token = generateToken(consumer1._id);

        const consumer2Data = await createTestUser('consumer', { name: 'Consumer Two' });
        consumer2 = consumer2Data.user;
        consumer2Token = generateToken(consumer2._id);
    });

    beforeEach(async () => {
        // Create a workshop
        workshop = await Workshop.create({
            artisan: artisan._id,
            title: 'Traditional Pottery Workshop',
            scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            fee: 1000,
            max_participants: 5,
            status: 'Scheduled',
        });

        // Create two bookings
        booking1 = await WorkshopBooking.create({
            workshop: workshop._id,
            consumer: consumer1._id,
            participants_count: 1,
            total_amount: 1000,
            payment_status: 'Paid',
            booking_status: 'Confirmed',
        });

        booking2 = await WorkshopBooking.create({
            workshop: workshop._id,
            consumer: consumer2._id,
            participants_count: 1,
            total_amount: 1000,
            payment_status: 'Paid',
            booking_status: 'Confirmed',
        });

        // Create escrow transactions
        await Transaction.create({
            user: consumer1._id,
            related_user: artisan._id,
            type: 'workshop_payment',
            amount: 1000,
            status: 'hold',
            description: 'Workshop booking payment',
        });

        await Transaction.create({
            user: consumer2._id,
            related_user: artisan._id,
            type: 'workshop_payment',
            amount: 1000,
            status: 'hold',
            description: 'Workshop booking payment',
        });
    });

    afterEach(async () => {
        await Workshop.deleteMany({});
        await WorkshopBooking.deleteMany({});
        await Transaction.deleteMany({});
    });

    describe('POST /api/v1/commerce/workshops/:workshopId/finalize-attendance', () => {
        test('Should finalize attendance with all participants attended', async () => {
            const response = await request(app)
                .post(`/api/v1/commerce/workshops/${workshop._id}/finalize-attendance`)
                .set(authHeaders(artisanToken))
                .send({
                    attendedBookingIds: [booking1._id.toString(), booking2._id.toString()],
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.settlement).toMatchObject({
                totalRevenue: 2000,
                platformFee: 200, // 10% of 2000
                artisanPayout: 1800, // 90% of 2000
                refundsProcessed: 0,
                attendedCount: 2,
                noShowCount: 0,
            });

            // Verify bookings updated
            const updatedBooking1 = await WorkshopBooking.findById(booking1._id);
            expect(updatedBooking1.booking_status).toBe('Attended');

            // Verify transactions created
            const artisanPayout = await Transaction.findOne({
                user: artisan._id,
                type: 'workshop_payout',
            });
            expect(artisanPayout).toBeTruthy();
            expect(artisanPayout.amount).toBe(1800);

            const platformFees = await Transaction.find({ type: 'platform_fee' });
            const totalFees = platformFees.reduce((sum, t) => sum + t.amount, 0);
            expect(totalFees).toBe(200);
        });

        test('Should process refunds for no-show participants', async () => {
            const response = await request(app)
                .post(`/api/v1/commerce/workshops/${workshop._id}/finalize-attendance`)
                .set(authHeaders(artisanToken))
                .send({
                    attendedBookingIds: [booking1._id.toString()], // Only consumer1 attended
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.settlement).toMatchObject({
                totalRevenue: 1000, // Only from attended
                platformFee: 200, // 100 from attended + 100 from no-show
                artisanPayout: 900, // 90% of 1000
                refundsProcessed: 900, // 90% of 1000 to no-show
                attendedCount: 1,
                noShowCount: 1,
            });

            // Verify attended booking
            const updatedBooking1 = await WorkshopBooking.findById(booking1._id);
            expect(updatedBooking1.booking_status).toBe('Attended');

            // Verify no-show booking
            const updatedBooking2 = await WorkshopBooking.findById(booking2._id);
            expect(updatedBooking2.booking_status).toBe('Cancelled');
            expect(updatedBooking2.payment_status).toBe('Refunded');

            // Verify refund transaction
            const refund = await Transaction.findOne({
                user: consumer2._id,
                type: 'workshop_refund',
            });
            expect(refund).toBeTruthy();
            expect(refund.amount).toBe(900); // 90% of 1000
        });

        test('Should fail if non-artisan tries to finalize', async () => {
            const response = await request(app)
                .post(`/api/v1/commerce/workshops/${workshop._id}/finalize-attendance`)
                .set(authHeaders(consumer1Token))
                .send({
                    attendedBookingIds: [booking1._id.toString()],
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        test('Should fail if artisan does not own workshop', async () => {
            const otherArtisanData = await createTestUser('artisan', { name: 'Other Artisan' });
            const otherArtisan = otherArtisanData.user;
            const otherArtisanToken = generateToken(otherArtisan._id);

            const response = await request(app)
                .post(`/api/v1/commerce/workshops/${workshop._id}/finalize-attendance`)
                .set(authHeaders(otherArtisanToken))
                .send({
                    attendedBookingIds: [booking1._id.toString()],
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        test('Should fail if workshop already completed', async () => {
            workshop.status = 'Completed';
            await workshop.save();

            const response = await request(app)
                .post(`/api/v1/commerce/workshops/${workshop._id}/finalize-attendance`)
                .set(authHeaders(artisanToken))
                .send({
                    attendedBookingIds: [booking1._id.toString()],
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('Should mark workshop as completed after finalization', async () => {
            await request(app)
                .post(`/api/v1/commerce/workshops/${workshop._id}/finalize-attendance`)
                .set(authHeaders(artisanToken))
                .send({
                    attendedBookingIds: [booking1._id.toString(), booking2._id.toString()],
                });

            const updatedWorkshop = await Workshop.findById(workshop._id);
            expect(updatedWorkshop.status).toBe('Completed');
        });
    });

    describe('POST /api/v1/commerce/workshops/:workshopId/cancel-workshop', () => {
        test('Should cancel workshop and refund all participants 100%', async () => {
            const response = await request(app)
                .post(`/api/v1/commerce/workshops/${workshop._id}/cancel-workshop`)
                .set(authHeaders(artisanToken))
                .send({
                    cancellation_reason: 'Emergency situation',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.refunds).toMatchObject({
                totalRefunded: 2000,
                participantCount: 2,
            });

            // Verify workshop cancelled
            const updatedWorkshop = await Workshop.findById(workshop._id);
            expect(updatedWorkshop.status).toBe('Cancelled');
            expect(updatedWorkshop.cancellation_reason).toBe('Emergency situation');

            // Verify all bookings cancelled and refunded
            const allBookings = await WorkshopBooking.find({ workshop: workshop._id });
            allBookings.forEach(booking => {
                expect(booking.booking_status).toBe('Cancelled');
                expect(booking.payment_status).toBe('Refunded');
            });

            // Verify refund transactions (100% each)
            const refunds = await Transaction.find({ type: 'workshop_refund' });
            expect(refunds.length).toBe(2);
            refunds.forEach(refund => {
                expect(refund.amount).toBe(1000); // Full refund
            });
        });

        test('Should fail if non-artisan tries to cancel workshop', async () => {
            const response = await request(app)
                .post(`/api/v1/commerce/workshops/${workshop._id}/cancel-workshop`)
                .set(authHeaders(consumer1Token))
                .send({
                    cancellation_reason: 'Testing',
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        test('Should fail if artisan does not own workshop', async () => {
            const otherArtisanData = await createTestUser('artisan', { name: 'Another Artisan' });
            const otherArtisan = otherArtisanData.user;
            const otherToken = generateToken(otherArtisan._id);

            const response = await request(app)
                .post(`/api/v1/commerce/workshops/${workshop._id}/cancel-workshop`)
                .set(authHeaders(otherToken))
                .send({
                    cancellation_reason: 'Testing',
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        test('Should fail if workshop already completed', async () => {
            workshop.status = 'Completed';
            await workshop.save();

            const response = await request(app)
                .post(`/api/v1/commerce/workshops/${workshop._id}/cancel-workshop`)
                .set(authHeaders(artisanToken))
                .send({
                    cancellation_reason: 'Too late',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/commerce/workshops/artisan/:artisanId/bookings', () => {
        test('Should get all bookings for artisan', async () => {
            const response = await request(app)
                .get(`/api/v1/commerce/workshops/artisan/${artisan._id}/bookings`)
                .set(authHeaders(artisanToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.bookings.length).toBe(2);
        });

        test('Should fail if accessing another artisan bookings', async () => {
            const response = await request(app)
                .get(`/api/v1/commerce/workshops/artisan/${artisan._id}/bookings`)
                .set(authHeaders(consumer1Token));

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });
});
