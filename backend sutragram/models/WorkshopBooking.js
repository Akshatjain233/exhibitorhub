import mongoose from 'mongoose';

const workshopBookingSchema = new mongoose.Schema({
    workshop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workshop',
        required: true,
    },
    consumer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    participants_count: {
        type: Number,
        default: 1,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    payment_status: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded'],
        default: 'Pending',
    },
    booking_status: {
        type: String,
        enum: ['Confirmed', 'Cancelled', 'Attended'],
        default: 'Confirmed',
    },
}, { timestamps: true });

const WorkshopBooking = mongoose.model('WorkshopBooking', workshopBookingSchema);
export default WorkshopBooking;
