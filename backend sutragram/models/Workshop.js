import mongoose from 'mongoose';

const workshopSchema = new mongoose.Schema({
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    scheduled_at: {
        type: Date,
        required: true,
    },
    fee: {
        type: Number,
        required: true,
    },
    max_participants: {
        type: Number,
        default: 10,
    },
    current_participants: {
        type: Number,
        default: 0,
    },
    duration: {
        type: Number,
        default: 1,
    },
    location: {
        type: String,
        default: 'Online',
    },
    image_url: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled',
    },
    cancellation_reason: {
        type: String,
    },
}, { timestamps: true });

const Workshop = mongoose.model('Workshop', workshopSchema);
export default Workshop;
