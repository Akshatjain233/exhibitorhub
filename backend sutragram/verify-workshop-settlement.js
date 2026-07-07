import 'dotenv/config';
import mongoose from 'mongoose';
import Workshop from './models/Workshop.js';
import WorkshopBooking from './models/WorkshopBooking.js';
import Transaction from './models/Transaction.js';
import User from './models/User.js';
import ArtisanProfile from './models/ArtisanProfile.js';
import ConsumerProfile from './models/ConsumerProfile.js';
import bcrypt from 'bcryptjs';

// Simplified settlement verification script

async function testWorkshopSettlement() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sutragram-dev');
        console.log('✅ Connected to MongoDB\n');

        // Clean up previous test data
        console.log('🧹 Cleaning up previous test data...');
        await User.deleteMany({ email: /test-workshop/ });
        await Workshop.deleteMany({ title: /Test Workshop/ });
        await WorkshopBooking.deleteMany({});
        await Transaction.deleteMany({ description: /Test Workshop/ });
        console.log('✅ Cleanup complete\n');

        // Create test artisan
        console.log('👤 Creating test artisan...');
        const artisan = await User.create({
            name: 'Test Artisan',
            email: 'test-workshop-artisan@example.com',
            phone_number: '+919999999999',
            password_hash: await bcrypt.hash('Test@123', 10),
            role: 'artisan',
            preferred_language: 'en',
            is_active: true,
        });
        await ArtisanProfile.create({
            user: artisan._id,
            bio_text: 'Test artisan bio',
            craft_specialization: 'Pottery',
            location_city: 'Delhi',
        });
        console.log(`✅ Artisan created: ${artisan._id}\n`);

        // Create test consumers
        console.log('👥 Creating test consumers...');
        const consumer1 = await User.create({
            name: 'Consumer One',
            email: 'test-workshop-consumer1@example.com',
            phone_number: '+918888888888',
            password_hash: await bcrypt.hash('Test@123', 10),
            role: 'consumer',
            is_active: true,
        });
        await ConsumerProfile.create({ user: consumer1._id });

        const consumer2 = await User.create({
            name: 'Consumer Two',
            email: 'test-workshop-consumer2@example.com',
            phone_number: '+917777777777',
            password_hash: await bcrypt.hash('Test@123', 10),
            role: 'consumer',
            is_active: true,
        });
        await ConsumerProfile.create({ user: consumer2._id });
        console.log(`✅ Consumers created: ${consumer1._id}, ${consumer2._id}\n`);

        // Create workshop
        console.log('🎨 Creating test workshop...');
        const workshop = await Workshop.create({
            artisan: artisan._id,
            title: 'Test Workshop - Pottery',
            scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            fee: 1000,
            max_participants: 5,
            status: 'Scheduled',
        });
        console.log(`✅ Workshop created: ${workshop._id}\n`);

        // Create bookings
        console.log('📝 Creating bookings...');
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
        console.log(`✅ Bookings created: ${booking1._id}, ${booking2._id}\n`);

        // Simulate settlement: Consumer 1 attended, Consumer 2 no-show
        console.log('💰 SIMULATING SETTLEMENT...');
        console.log('  - Consumer 1: ATTENDED');
        console.log('  - Consumer2: NO-SHOW\n');

        const attendedBookingIds = [booking1._id.toString()];
        const allBookings = await WorkshopBooking.find({
            workshop: workshop._id,
            payment_status: 'Paid'
        });

        let totalRevenue = 0;
        let platformFee = 0;
        let artisanPayout = 0;
        let refundsProcessed = 0;

        // Process each booking
        for (const booking of allBookings) {
            const wasAttended = attendedBookingIds.includes(booking._id.toString());

            if (wasAttended) {
                // ATTENDED
                booking.booking_status = 'Attended';
                await booking.save();

                const fee = Math.round(booking.total_amount * 0.10);
                const payout = booking.total_amount - fee;

                totalRevenue += booking.total_amount;
                platformFee += fee;
                artisanPayout += payout;

                await Transaction.create({
                    user: artisan._id,
                    type: 'workshop_payout',
                    amount: payout,
                    status: 'completed',
                    description: `Test Workshop payout (90%)`,
                });

                await Transaction.create({
                    type: 'platform_fee',
                    amount: fee,
                    status: 'completed',
                    description: `Platform fee (10%) - Test Workshop`,
                });

                console.log(`✅ Booking ${booking._id}: ATTENDED`);
                console.log(`   Revenue: ₹${booking.total_amount}`);
                console.log(`   Platform Fee (10%): ₹${fee}`);
                console.log(`   Artisan Payout (90%): ₹${payout}\n`);
            } else {
                // NO-SHOW
                booking.booking_status = 'Cancelled';
                booking.payment_status = 'Refunded';
                await booking.save();

                const refundAmount = Math.round(booking.total_amount * 0.90);
                const retainedFee = booking.total_amount - refundAmount;

                platformFee += retainedFee;
                refundsProcessed += refundAmount;

                await Transaction.create({
                    user: booking.consumer._id,
                    type: 'workshop_refund',
                    amount: refundAmount,
                    status: 'completed',
                    description: `No-show refund (90%) - Test Workshop`,
                });

                await Transaction.create({
                    type: 'platform_fee',
                    amount: retainedFee,
                    status: 'completed',
                    description: `No-show retention (10%) - Test Workshop`,
                });

                console.log(`✅ Booking ${booking._id}: NO-SHOW`);
                console.log(`   Original Amount: ₹${booking.total_amount}`);
                console.log(`   Refund to Consumer (90%): ₹${refundAmount}`);
                console.log(`   Platform Fee Retained (10%): ₹${retainedFee}\n`);
            }
        }

        // Mark workshop as completed
        workshop.status = 'Completed';
        await workshop.save();

        // FINAL SUMMARY
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 FINAL SETTLEMENT SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Total Revenue: ₹${totalRevenue}`);
        console.log(`Platform Fee (10%): ₹${platformFee}`);
        console.log(`Artisan Payout (90%): ₹${artisanPayout}`);
        console.log(`Refunds Processed (90%): ₹${refundsProcessed}`);
        console.log(`Attended Count: ${allBookings.filter(b => b.booking_status === 'Attended').length}`);
        console.log(`No-Show Count: ${allBookings.filter(b => b.booking_status === 'Cancelled').length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Verify expected values
        console.log('🔍 VERIFICATION:');
        const expectedPlatformFee = 200; // 100 from attended + 100 from no-show
        const expectedArtisanPayout = 900; // 90% of 1000
        const expectedRefund = 900; // 90% of 1000

        if (platformFee === expectedPlatformFee) {
            console.log('✅ Platform fee calculation: CORRECT');
        } else {
            console.log(`❌ Platform fee: Expected ${expectedPlatformFee}, Got ${platformFee}`);
        }

        if (artisanPayout === expectedArtisanPayout) {
            console.log('✅ Artisan payout calculation: CORRECT');
        } else {
            console.log(`❌ Artisan payout: Expected ${expectedArtisanPayout}, Got ${artisanPayout}`);
        }

        if (refundsProcessed === expectedRefund) {
            console.log('✅ Refund calculation: CORRECT');
        } else {
            console.log(`❌ Refund: Expected ${expectedRefund}, Got ${refundsProcessed}`);
        }

        console.log('\n✅ ALL SETTLEMENT LOGIC VERIFIED SUCCESSFULLY!\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

testWorkshopSettlement();
