import express from 'express';
import {
    createQuoteRequest,
    getQuotes,
    getQuoteById,
    respondToQuote,
    acceptQuote,
    rejectQuote,
    cancelQuote,
    getQuoteStats,
} from '../controllers/quoteController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Quote CRUD
router.route('/')
    .get(getQuotes)
    .post(createQuoteRequest);

router.get('/stats', getQuoteStats);

router.route('/:id')
    .get(getQuoteById)
    .delete(cancelQuote);

// Quote actions
router.post('/:id/respond', respondToQuote);
router.post('/:id/accept', acceptQuote);
router.post('/:id/reject', rejectQuote);

export default router;
