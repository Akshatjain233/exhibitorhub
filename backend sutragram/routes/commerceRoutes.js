import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getArtisanProducts,
    getFeedProducts,
    likeProduct,
    unlikeProduct,
    shareProduct,
    getProductComments,
    createProductComment,
} from '../controllers/productController.js';
import { validateProducts } from '../controllers/validateProductsController.js';
import {
    createOrder,
    getOrderById,
    updateOrderStatus,
    verifyDelivery,
    getMyOrders,
} from '../controllers/orderController.js';
import {
    processPayment,
    releasePayment,
    getTransactions,
    verifyPaymentAccount,
    verifyPayment,
    getCheckoutPage,
    verifyPaymentWeb,
    paymentCallback,
    purchaseLeadCredits,
} from '../controllers/paymentController.js';
import {
    createWorkshop,
    getWorkshopById,
    updateWorkshop,
    deleteWorkshop,
    getAllWorkshops,
    getWorkshopsByArtisan,
} from '../controllers/workshopController.js';
import {
    bookWorkshop,
    verifyWorkshopPayment,
    cancelBooking,
    getMyBookings,
    getWorkshopBookings,
    getWorkshopParticipants,
    getBookingsByArtisan,
    finalizeAttendance,
    cancelWorkshopByArtisan,
} from '../controllers/workshopBookingController.js';

const router = express.Router();

// Product routes - static paths must come before dynamic /:productId
router.get('/products/feed', getFeedProducts);                               // Home feed products
router.get('/products/artisan/:artisanId', getArtisanProducts);              // Artisan's products
router.get('/products/:productId/comments', getProductComments);
router.post('/products/:productId/comments', protect, createProductComment);
router.post('/products/:productId/like', protect, likeProduct);
router.post('/products/:productId/unlike', protect, unlikeProduct);
router.post('/products/:productId/share', protect, shareProduct);
router.post('/products', protect, restrictTo('artisan'), createProduct);
router.post('/products/validate', validateProducts);                         // Public - validate product IDs (for cart cleanup)
router.get('/products/:productId', getProduct);
router.put('/products/:productId', protect, restrictTo('artisan'), updateProduct);
router.delete('/products/:productId', protect, restrictTo('artisan'), deleteProduct);
router.get('/products', getAllProducts);

// Order routes
router.post('/orders', protect, createOrder);
router.get('/orders/my-orders', protect, getMyOrders);
// Order alias - allows GET /api/v1/orders as standard REST pattern
router.get('/orders', protect, getMyOrders);
router.get('/orders/:orderId', protect, getOrderById);
router.put('/orders/:orderId/status', protect, updateOrderStatus);
router.post('/orders/:orderId/verify-delivery', protect, verifyDelivery);

// Payment routes
router.get('/payments/checkout-page', getCheckoutPage);         // Public - serves HTML checkout
router.get('/payments/callback', paymentCallback);              // Public - payment redirect callback
router.post('/payments/verify-web', verifyPaymentWeb);          // Public - verify from web checkout
router.post('/payments/verify', protect, verifyPayment);
router.post('/payments/process', protect, processPayment);
router.post('/payments/release/:orderId', protect, releasePayment);
router.get('/payments/transactions', protect, getTransactions);
router.post('/payments/verify-account', protect, restrictTo('artisan'), verifyPaymentAccount);
router.post('/payments/supplier/credits/purchase', protect, restrictTo('supplier'), purchaseLeadCredits);
// Note: Dispute routes are now at /api/v1/disputes/* (see disputeRoutes.js)

// Workshop routes (ORDER MATTERS: specific routes before generic ones)
router.post('/workshops', protect, restrictTo('artisan'), createWorkshop);

// More specific workshop routes (must come before /workshops/:id)
router.get('/workshops/artisan/:artisanId', getWorkshopsByArtisan);
router.post('/workshops/:workshopId/finalize-attendance', protect, restrictTo('artisan'), finalizeAttendance);
router.post('/workshops/:workshopId/cancel-workshop', protect, restrictTo('artisan'), cancelWorkshopByArtisan);

// Workshop booking routes (must come before /workshops/:id)
router.post('/workshops/:workshopId/book', protect, bookWorkshop);
router.post('/workshops/:workshopId/verify-payment', protect, verifyWorkshopPayment);
router.post('/workshops/bookings/:bookingId/cancel', protect, cancelBooking);
router.get('/workshops/bookings/my-bookings', protect, getMyBookings);
router.get('/workshops/:workshopId/bookings', protect, restrictTo('artisan'), getWorkshopBookings);
router.get('/workshops/:workshopId/participants', protect, restrictTo('artisan'), getWorkshopParticipants);
router.get('/workshops/artisan/:artisanId/bookings', protect, restrictTo('artisan'), getBookingsByArtisan);

// Generic workshop routes (must come AFTER specific routes)
router.get('/workshops/:id', getWorkshopById);
router.put('/workshops/:id', protect, restrictTo('artisan'), updateWorkshop);
router.delete('/workshops/:id', protect, restrictTo('artisan'), deleteWorkshop);
router.get('/workshops', getAllWorkshops);

export default router;
