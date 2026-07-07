import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    category: {
        type: String,
        enum: [
            'order',           // Order status updates
            'message',         // New message received
            'comment',         // Someone commented on your content
            'like',            // Someone liked your content
            'follow',          // New follower
            'product',         // Product updates (back in stock, price drop)
            'workshop',        // Workshop bookings and reminders
            'lead',            // New B2B lead unlocked
            'quote',           // Quote request received/accepted
            'payment',         // Payment received/completed
            'verification',    // Profile verification status
            'system',          // System announcements
        ],
        required: true,
    },
    title: {
        type: String,
        required: true,
        maxLength: 100,
    },
    message: {
        type: String,
        required: true,
        maxLength: 500,
    },
    is_read: {
        type: Boolean,
        default: false,
        index: true,
    },
    read_at: {
        type: Date,
    },
    // Related entity for navigation
    related_entity: {
        entity_type: {
            type: String,
            enum: ['order', 'message', 'video', 'product', 'workshop', 'user', 'lead', 'quote'],
        },
        entity_id: {
            type: mongoose.Schema.Types.ObjectId,
        },
    },
    // Optional action data
    action_data: {
        type: mongoose.Schema.Types.Mixed,
    },
    // Optional actor (who triggered this notification)
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

// Compound indexes for efficient queries
notificationSchema.index({ user: 1, is_read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, category: 1, createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
    try {
        const notification = await this.create(data);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
    this.is_read = true;
    this.read_at = new Date();
    return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
