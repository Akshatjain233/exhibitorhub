const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/v1/chat:
 *   get:
 *     summary: Get all chats for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', chatController.getChats);

/**
 * @swagger
 * /api/v1/chat/send:
 *   post:
 *     summary: Send a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.post('/send', chatController.sendMessage);

/**
 * @swagger
 * /api/v1/chat/user/{participantId}:
 *   get:
 *     summary: Get or create a chat with another user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/user/:participantId', chatController.getOrCreateChat);

/**
 * @swagger
 * /api/v1/chat/{chatId}/messages:
 *   get:
 *     summary: Get messages for a chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:chatId/messages', chatController.getChatMessages);

module.exports = router;
