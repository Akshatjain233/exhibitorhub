import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    getComments,
    getReplies,
    createComment,
    deleteComment,
    likeComment,
} from '../controllers/commentController.js';

const router = express.Router();

// Comment routes
router.get('/:commentId/replies', getReplies);
router.post('/:commentId/like', protect, likeComment);
router.delete('/:commentId', protect, deleteComment);

export default router;
