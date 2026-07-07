import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    sendMessage,
    getChatHistory,
    getConversations,
    sendCustomQuote,
} from '../controllers/chatController.js';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from '../controllers/notificationController.js';
import {
    shareVideo,
    generateShareLink,
} from '../controllers/shareController.js';

const router = express.Router();

// Chat routes
router.post('/chat/send', protect, sendMessage);
// Chat alias - allows POST /api/v1/social/chat/:userId
router.post('/chat/:userId', protect, sendMessage);
router.get('/chat/history/:userId', protect, getChatHistory);
router.get('/chat/conversations', protect, getConversations);
router.post('/chat/send-quote', protect, sendCustomQuote);

// Notification routes
router.get('/notifications', protect, getNotifications);
router.get('/notifications/unread-count', protect, getUnreadCount);
router.post('/notifications/:notificationId/read', protect, markAsRead);
router.post('/notifications/read-all', protect, markAllAsRead);
router.delete('/notifications/:notificationId', protect, deleteNotification);

// Share routes
router.post('/share/:videoId', protect, shareVideo);
router.get('/share/:videoId/link', generateShareLink);

export default router;
