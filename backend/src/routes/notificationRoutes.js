const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const validate = require('../middleware/validate');
const { sendNotificationSchema, broadcastNotificationSchema } = require('../validators/notificationValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app user notifications
 */

/**
 * @swagger
 * /api/v1/notifications/send:
 *   post:
 *     summary: Send notification to a specific user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Notification sent
 */
router.post('/send', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(sendNotificationSchema), notificationController.sendNotification);

/**
 * @swagger
 * /api/v1/notifications/broadcast:
 *   post:
 *     summary: Broadcast notification to multiple users
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Broadcast sent
 */
router.post('/broadcast', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(broadcastNotificationSchema), notificationController.broadcastNotification);

/**
 * @swagger
 * /api/v1/notifications/me:
 *   get:
 *     summary: Get my notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My notifications
 */
router.get('/me', protect, notificationController.getMyNotifications);

/**
 * @swagger
 * /api/v1/notifications/me/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All marked as read
 */
router.patch('/me/read-all', protect, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.patch('/:id/read', protect, notificationController.markAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 */
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;
