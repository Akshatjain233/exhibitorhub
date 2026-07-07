import WorkshopBooking from '../models/WorkshopBooking.js';
import Workshop from '../models/Workshop.js';
import Transaction from '../models/Transaction.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';

// @desc    Book a workshop
// @route   POST /api/workshops/:workshopId/book
// @access  Private (consumer only)
export const bookWorkshop = async (req, res) => {
    try {
        const { workshopId } = req.params;
        const { participants_count = 1 } = req.body;

        if (!Number.isInteger(participants_count) || participants_count < 1) {
            return res.status(400).json({
                success: false,
                message: 'participants_count must be a positive integer.',
            });
        }

        const workshop = await Workshop.findById(workshopId);

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop not found.',
            });
        }

        if (workshop.status !== 'Scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Workshop is not available for booking.',
            });
        }

        // Prevent duplicate bookings by the same user
        const existingBooking = await WorkshopBooking.findOne({
            workshop: workshopId,
            consumer: req.user._id,
            booking_status: { $ne: 'Cancelled' },
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'You have already booked this workshop.',
            });
        }

        // Check current bookings
        const currentBookings = await WorkshopBooking.aggregate([
            { $match: { workshop: workshop._id, booking_status: 'Confirmed' } },
            { $group: { _id: null, totalParticipants: { $sum: '$participants_count' } } }
        ]);

        const bookedCount = currentBookings[0]?.totalParticipants || 0;

        if (bookedCount + participants_count > workshop.max_participants) {
            return res.status(400).json({
                success: false,
                message: 'Not enough seats available.',
            });
        }

        // Calculate total amount
        const total_amount = workshop.fee * participants_count;

        const razorpayOrder = await createRazorpayOrder(
            total_amount,
            `workshop_${workshopId}_${Date.now()}`,
            {
                workshop_id: workshopId,
                consumer_id: req.user._id.toString(),
                participants_count: participants_count.toString(),
            }
        );

        res.status(201).json({
            success: true,
            message: 'Workshop payment order created successfully.',
            data: {
                workshop_id: workshopId,
                participants_count,
                amount: total_amount,
                razorpay_order_id: razorpayOrder.id,
                razorpay_key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SLYAr0QqnA1HkO',
            },
        });
    } catch (error) {
        console.error('Book workshop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to book workshop.',
            error: error.message,
        });
    }
};

// @desc    Verify workshop payment and create booking
// @route   POST /api/workshops/:workshopId/verify-payment
// @access  Private (consumer only)
export const verifyWorkshopPayment = async (req, res) => {
    try {
        const { workshopId } = req.params;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            participants_count: participantsFromBody,
        } = req.body;

        // Accept participants_count from body or query (for modular hook compatibility)
        const participants_count = participantsFromBody || parseInt(req.query.participants_count) || 1;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification parameters.',
            });
        }

        if (!Number.isInteger(participants_count) || participants_count < 1) {
            return res.status(400).json({
                success: false,
                message: 'participants_count must be a positive integer.',
            });
        }

        const isValidSignature = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValidSignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature.',
            });
        }

        const workshop = await Workshop.findById(workshopId);

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop not found.',
            });
        }

        if (workshop.status !== 'Scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Workshop is not available for booking.',
            });
        }

        const existingBooking = await WorkshopBooking.findOne({
            workshop: workshopId,
            consumer: req.user._id,
            booking_status: { $ne: 'Cancelled' },
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'You have already booked this workshop.',
            });
        }

        const currentBookings = await WorkshopBooking.aggregate([
            { $match: { workshop: workshop._id, booking_status: 'Confirmed' } },
            { $group: { _id: null, totalParticipants: { $sum: '$participants_count' } } }
        ]);

        const bookedCount = currentBookings[0]?.totalParticipants || 0;

        if (bookedCount + participants_count > workshop.max_participants) {
            return res.status(400).json({
                success: false,
                message: 'Not enough seats available.',
            });
        }

        const total_amount = workshop.fee * participants_count;

        const booking = await WorkshopBooking.create({
            workshop: workshopId,
            consumer: req.user._id,
            participants_count,
            total_amount,
            payment_status: 'Paid',
            booking_status: 'Confirmed',
        });

        workshop.current_participants = (workshop.current_participants || 0) + participants_count;
        await workshop.save();

        await Transaction.create({
            user: req.user._id,
            related_user: workshop.artisan,
            type: 'workshop_payment',
            amount: total_amount,
            status: 'hold',
            description: `Workshop booking payment - ${workshop.title}`,
        });

        res.status(200).json({
            success: true,
            message: 'Workshop payment verified and booking confirmed.',
            data: { booking },
        });
    } catch (error) {
        console.error('Verify workshop payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify workshop payment.',
            error: error.message,
        });
    }
};

// @desc    Get my bookings
// @route   GET /api/workshops/my-bookings
// @access  Private (consumer only)
export const getMyBookings = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await WorkshopBooking.find({ consumer: req.user._id })
            .populate({
                path: 'workshop',
                populate: { path: 'artisan', select: 'name' }
            })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await WorkshopBooking.countDocuments({ consumer: req.user._id });

        res.status(200).json({
            success: true,
            data: {
                bookings,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings.',
            error: error.message,
        });
    }
};

// @desc    Cancel booking
// @route   PUT /api/workshops/bookings/:bookingId/cancel
// @access  Private (consumer only)
export const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await WorkshopBooking.findOne({
            _id: bookingId,
            consumer: req.user._id,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found.',
            });
        }

        if (booking.booking_status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled.',
            });
        }

        booking.booking_status = 'Cancelled';
        booking.payment_status = 'Refunded';
        await booking.save();

        // Update workshop current_participants count
        const workshop = await Workshop.findById(booking.workshop);
        if (workshop) {
            workshop.current_participants = Math.max(0, (workshop.current_participants || 0) - booking.participants_count);
            await workshop.save();
        }

        // Process 100% refund for consumer cancellation
        await Transaction.create({
            user: req.user._id,
            type: 'workshop_refund',
            amount: booking.total_amount,
            status: 'completed',
            description: `Full refund for cancelled workshop booking`,
        });

        res.status(200).json({
            success: true,
            message: 'Booking cancelled and full refund processed.',
            data: { booking },
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking.',
            error: error.message,
        });
    }
};

// @desc    Get workshop bookings (for artisan)
// @route   GET /api/workshops/:workshopId/bookings
// @access  Private (artisan only)
export const getWorkshopBookings = async (req, res) => {
    try {
        const { workshopId } = req.params;

        const workshop = await Workshop.findById(workshopId);

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop not found.',
            });
        }

        // Verify ownership
        if (workshop.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view bookings for this workshop.',
            });
        }

        const bookings = await WorkshopBooking.find({ workshop: workshopId })
            .populate('consumer', 'name email phone_number')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { bookings },
        });
    } catch (error) {
        console.error('Get workshop bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workshop bookings.',
            error: error.message,
        });
    }
};

// @desc    Get workshop participants for attendance marking
// @route   GET /api/workshops/:workshopId/participants
// @access  Private (artisan only)
export const getWorkshopParticipants = async (req, res) => {
    try {
        const { workshopId } = req.params;

        const workshop = await Workshop.findById(workshopId);

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop not found.',
            });
        }

        if (workshop.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view participants for this workshop.',
            });
        }

        const bookings = await WorkshopBooking.find({
            workshop: workshopId,
            payment_status: 'Paid',
            booking_status: { $in: ['Confirmed', 'Attended'] },
        })
            .populate('consumer', 'name profile_image_url email phone_number')
            .sort({ createdAt: -1 });

        const participants = bookings.map((booking) => ({
            bookingId: booking._id,
            participants_count: booking.participants_count,
            total_amount: booking.total_amount,
            attended: booking.booking_status === 'Attended',
            user: booking.consumer,
        }));

        res.status(200).json({
            success: true,
            data: { participants },
        });
    } catch (error) {
        console.error('Get workshop participants error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workshop participants.',
            error: error.message,
        });
    }
};

// @desc    Get artisan's all workshop bookings
// @route   GET /api/workshops/artisan/:artisanId/bookings
// @access  Private (artisan only)
export const getBookingsByArtisan = async (req, res) => {
    try {
        const { artisanId } = req.params;

        // Verify ownership
        if (artisanId !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized.',
            });
        }

        const workshops = await Workshop.find({ artisan: artisanId }).select('_id');
        const workshopIds = workshops.map(w => w._id);

        const bookings = await WorkshopBooking.find({ workshop: { $in: workshopIds } })
            .populate('workshop', 'title scheduled_time')
            .populate('consumer', 'name email phone_number')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { bookings },
        });
    } catch (error) {
        console.error('Get artisan bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings.',
            error: error.message,
        });
    }
};

// @desc    Mark attendance and process settlement (Requirement 22 & 23)
// @route   POST /api/workshops/:workshopId/finalize-attendance
// @access  Private (artisan only)
export const finalizeAttendance = async (req, res) => {
    try {
        const { workshopId } = req.params;
        const { attendedBookingIds } = req.body; // Array of booking IDs who attended

        if (!Array.isArray(attendedBookingIds)) {
            return res.status(400).json({
                success: false,
                message: 'attendedBookingIds must be an array.',
            });
        }

        const workshop = await Workshop.findById(workshopId).populate('artisan');

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop not found.',
            });
        }

        // Verify ownership
        if (workshop.artisan._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to finalize this workshop.',
            });
        }

        if (workshop.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Workshop has already been finalized.',
            });
        }

        // Get all bookings for this workshop
        const allBookings = await WorkshopBooking.find({ workshop: workshopId, payment_status: 'Paid' })
            .populate('consumer', 'name email');

        let totalRevenue = 0;
        let platformFee = 0;
        let artisanPayout = 0;
        let refundsProcessed = 0;

        const settlementReport = {
            attended: [],
            noShow: [],
        };

        // Process each booking
        for (const booking of allBookings) {
            const bookingIdStr = booking._id.toString();
            const wasAttended = attendedBookingIds.includes(bookingIdStr);

            if (wasAttended) {
                // ATTENDED: Mark as attended, calculate artisan payout
                booking.booking_status = 'Attended';
                await booking.save();

                const fee = Math.round(booking.total_amount * 0.10); // 10% platform fee
                const payout = booking.total_amount - fee; // 90% to artisan

                totalRevenue += booking.total_amount;
                platformFee += fee;
                artisanPayout += payout;

                settlementReport.attended.push({
                    bookingId: booking._id,
                    consumer: booking.consumer.name,
                    amount: booking.total_amount,
                    platformFee: fee,
                    artisanPayout: payout,
                });

                // Create transaction for artisan payout
                await Transaction.create({
                    user: workshop.artisan._id,
                    type: 'workshop_payout',
                    amount: payout,
                    status: 'completed',
                    description: `Workshop payout (90%) - ${workshop.title}`,
                });

                // Create platform fee transaction
                await Transaction.create({
                    type: 'platform_fee',
                    amount: fee,
                    status: 'completed',
                    description: `Platform fee (10%) from workshop - ${workshop.title}`,
                });

            } else {
                // NO-SHOW: Refund 90% to consumer, 10% retained as platform fee
                booking.booking_status = 'Cancelled';
                booking.payment_status = 'Refunded';
                await booking.save();

                const refundAmount = Math.round(booking.total_amount * 0.90); // 90% refund
                const retainedFee = booking.total_amount - refundAmount; // 10% platform fee

                platformFee += retainedFee;
                refundsProcessed += refundAmount;

                settlementReport.noShow.push({
                    bookingId: booking._id,
                    consumer: booking.consumer.name,
                    originalAmount: booking.total_amount,
                    refundAmount,
                    platformFee: retainedFee,
                });

                // Create refund transaction for consumer
                await Transaction.create({
                    user: booking.consumer._id,
                    type: 'workshop_refund',
                    amount: refundAmount,
                    status: 'completed',
                    description: `No-show refund (90%) - ${workshop.title}`,
                });

                // Create platform fee transaction for retained amount
                await Transaction.create({
                    type: 'platform_fee',
                    amount: retainedFee,
                    status: 'completed',
                    description: `No-show fee (10%) from workshop - ${workshop.title}`,
                });
            }
        }

        // Mark workshop as completed
        workshop.status = 'Completed';
        await workshop.save();

        res.status(200).json({
            success: true,
            message: 'Workshop finalized and settlement processed.',
            data: {
                workshop: {
                    id: workshop._id,
                    title: workshop.title,
                    status: workshop.status,
                },
                settlement: {
                    totalRevenue,
                    platformFee,
                    artisanPayout,
                    refundsProcessed,
                    attendedCount: settlementReport.attended.length,
                    noShowCount: settlementReport.noShow.length,
                },
                details: settlementReport,
            },
        });
    } catch (error) {
        console.error('Finalize attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to finalize workshop attendance.',
            error: error.message,
        });
    }
};

// @desc    Cancel workshop by artisan (100% refund to all)
// @route   POST /api/workshops/:workshopId/cancel-workshop
// @access  Private (artisan only)
export const cancelWorkshopByArtisan = async (req, res) => {
    try {
        const { workshopId } = req.params;
        const { cancellation_reason } = req.body;

        const workshop = await Workshop.findById(workshopId);

        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop not found.',
            });
        }

        // Verify ownership
        if (workshop.artisan.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this workshop.',
            });
        }

        if (workshop.status === 'Completed' || workshop.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel workshop in current status.',
            });
        }

        // Get all paid bookings
        const bookings = await WorkshopBooking.find({
            workshop: workshopId,
            payment_status: 'Paid'
        }).populate('consumer', 'name email');

        let totalRefunded = 0;
        const refundedBookings = [];

        // Process 100% refund for all consumers
        for (const booking of bookings) {
            booking.booking_status = 'Cancelled';
            booking.payment_status = 'Refunded';
            await booking.save();

            // Create refund transaction
            await Transaction.create({
                user: booking.consumer._id,
                type: 'workshop_refund',
                amount: booking.total_amount,
                status: 'completed',
                description: `Full refund due to workshop cancellation - ${workshop.title}`,
            });

            totalRefunded += booking.total_amount;
            refundedBookings.push({
                bookingId: booking._id,
                consumer: booking.consumer.name,
                refundAmount: booking.total_amount,
            });
        }

        // Mark workshop as cancelled
        workshop.status = 'Cancelled';
        workshop.cancellation_reason = cancellation_reason || 'Cancelled by artisan';
        await workshop.save();

        res.status(200).json({
            success: true,
            message: 'Workshop cancelled. Full refunds processed for all participants.',
            data: {
                workshop: {
                    id: workshop._id,
                    title: workshop.title,
                    status: workshop.status,
                },
                refunds: {
                    totalRefunded,
                    participantCount: refundedBookings.length,
                    refundedBookings,
                },
            },
        });
    } catch (error) {
        console.error('Cancel workshop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel workshop.',
            error: error.message,
        });
    }
};
