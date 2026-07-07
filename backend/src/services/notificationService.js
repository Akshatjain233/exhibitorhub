const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');

class NotificationService {
  async sendNotification(data) {
    // Note: Integration with WebSocket (Socket.IO) would happen here
    const notification = await notificationRepository.create(data);
    
    // Stub: global.io.to(data.recipient.toString()).emit('new_notification', notification);
    
    return notification;
  }

  async broadcastNotification(data) {
    const { exhibition, targetRole, title, message, type, link } = data;
    
    let query = {};
    if (targetRole && targetRole !== 'all') {
      query.role = targetRole;
    }
    
    const users = await userRepository.findAll(query, 0, 100000);
    const notificationsToInsert = users.map(user => ({
      recipient: user._id,
      exhibition,
      title,
      message,
      type,
      link
    }));

    if (notificationsToInsert.length === 0) return { success: true, count: 0 };

    const result = await notificationRepository.insertMany(notificationsToInsert);
    
    // Stub: global.io.emit('new_broadcast', { title, message }); // or emit to specific room

    return { success: true, count: result.length };
  }

  async getMyNotifications(userId, queryData) {
    const { page = 1, limit = 20, unreadOnly } = queryData;
    
    let query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notifications = await notificationRepository.findAll(query, skip, parseInt(limit));
    const total = await notificationRepository.count(query);
    const unreadCount = await notificationRepository.count({ recipient: userId, read: false });

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    };
  }

  async markAsRead(id, userId) {
    const notification = await notificationRepository.update(id, { read: true });
    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }
    // Access control
    if (notification.recipient.toString() !== userId) {
      const error = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }
    return notification;
  }

  async markAllAsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(id, userId) {
    const notification = await notificationRepository.update(id, { read: true }); // Need to fetch to verify recipient, doing update just to fetch is ok but better to do custom
    // Actually, delete directly if we find it:
    const notificationToDelete = await notificationRepository.findAll({ _id: id, recipient: userId });
    if (!notificationToDelete || notificationToDelete.length === 0) {
      const error = new Error('Notification not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }
    await notificationRepository.delete(id);
    return { success: true };
  }
}

module.exports = new NotificationService();
