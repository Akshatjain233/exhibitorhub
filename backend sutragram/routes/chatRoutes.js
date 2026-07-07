import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    getChats,
    getOrCreateChat,
    getChatMessages,
    markMessagesAsRead,
    archiveChat,
    toggleMuteChat,
} from '../controllers/chatController.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

/**
 * GET /api/chats
 * Retrieve all 1-on-1 chats for the authenticated user
 * Sorted by most recent message first
 */
router.get('/', getChats);

/**
 * GET /api/chats/:participantId/or-create
 * Get or create a 1-on-1 chat with a specific user
 */
router.get('/:participantId/or-create', getOrCreateChat);

/**
 * GET /api/chats/:chatId/messages
 * Fetch paginated messages for a specific chat
 * Query params: page (default 1), limit (default 50)
 */
router.get('/:chatId/messages', getChatMessages);

/**
 * PUT /api/chats/:chatId/read
 * Mark all messages in a chat as read
 */
router.put('/:chatId/read', markMessagesAsRead);

/**
 * PUT /api/chats/:chatId/archive
 * Archive a chat for the current user
 */
router.put('/:chatId/archive', archiveChat);

/**
 * PUT /api/chats/:chatId/mute
 * Mute/unmute a chat for the current user
 */
router.put('/:chatId/mute', toggleMuteChat);

export default router;
