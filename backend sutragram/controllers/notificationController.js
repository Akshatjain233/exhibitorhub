import Notification from '../models/Notification.js';

// @desc    Create notification (internal helper)
// @route   N/A (called from other controllers)
// @access  Private
export const createNotification = async (data, io = null) => {
    try {
        const notification = await Notification.createNotification(data);
        
        // Return populated notification
        const populatedNotification = await Notification.findById(notification._id)
            .populate('actor', 'name profile_picture role')
            .exec();

        // Emit real-time notification via Socket.IO if io instance provided
        if (io && data.user) {
            io.to(data.user.toString()).emit('new_notification', populatedNotification);
            console.log(`📡 Real-time notification sent to user: ${data.user}`);
        }

        return populatedNotification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, is_read, category } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { user: req.user._id };
        if (is_read !== undefined) {
            query.is_read = is_read === 'true';
        }
        if (category) {
            query.category = category;
        }

        const notifications = await Notification.find(query)
            .populate('actor', 'name profile_picture role')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            is_read: false,
        });

        res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications.',
            error: error.message,
        });
    }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            is_read: false,
        });

        res.status(200).json({
            success: true,
            data: { unreadCount },
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count.',
            error: error.message,
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:notificationId/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findOne({
            _id: notificationId,
            user: req.user._id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found.',
            });
        }

        await notification.markAsRead();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read.',
            data: { notification },
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read.',
            error: error.message,
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, is_read: false },
            { is_read: true, read_at: new Date() }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read.',
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read.',
            error: error.message,
        });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:notificationId
// @access  Private
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            user: req.user._id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully.',
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification.',
            error: error.message,
        });
    }
};

// Helper function to emit notification via Socket.IO
export const emitNotification = (io, userId, notification) => {
    if (io && userId) {
        io.to(userId.toString()).emit('new_notification', notification);
    }
};
