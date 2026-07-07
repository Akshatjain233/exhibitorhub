const notificationService = require('../services/notificationService');
const { successResponse } = require('../utils/response');

exports.sendNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.sendNotification(req.body);
    return successResponse(res, 201, 'Notification sent', notification);
  } catch (error) {
    next(error);
  }
};

exports.broadcastNotification = async (req, res, next) => {
  try {
    const result = await notificationService.broadcastNotification(req.body);
    return successResponse(res, 201, `Broadcast sent to ${result.count} users`, result);
  } catch (error) {
    next(error);
  }
};

exports.getMyNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.getMyNotifications(req.user.id, req.query);
    return successResponse(res, 200, 'Notifications retrieved', data);
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    return successResponse(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return successResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user.id);
    return successResponse(res, 200, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};
