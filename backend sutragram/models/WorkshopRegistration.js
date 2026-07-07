import mongoose from 'mongoose';

const workshopRegistrationSchema = new mongoose.Schema({
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
    attended: {
        type: Boolean,
        default: false,
    },
    amount_paid: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

const WorkshopRegistration = mongoose.model('WorkshopRegistration', workshopRegistrationSchema);
export default WorkshopRegistration;
