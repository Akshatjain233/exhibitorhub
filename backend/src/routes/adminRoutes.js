const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/admin/system/health:
 *   get:
 *     summary: Get system health
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/system/health', authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), adminController.getSystemHealth);

/**
 * @swagger
 * /api/v1/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/dashboard/stats', authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), adminController.getDashboardStats);

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users', authorize(ROLES.SUPER_ADMIN), adminController.getAllUsers);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/toggle-active:
 *   put:
 *     summary: Toggle user active status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/users/:userId/toggle-active', authorize(ROLES.SUPER_ADMIN), adminController.toggleUserActive);

/**
 * @swagger
 * /api/v1/admin/verifications/pending:
 *   get:
 *     summary: Get pending exhibitor verifications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/verifications/pending', authorize(ROLES.EXHIBITION_ADMIN, ROLES.SUPER_ADMIN), adminController.getPendingVerifications);

/**
 * @swagger
 * /api/v1/admin/exhibitors/{id}/verify:
 *   post:
 *     summary: Verify an exhibitor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/exhibitors/:id/verify', authorize(ROLES.EXHIBITION_ADMIN, ROLES.SUPER_ADMIN), adminController.verifyExhibitor);

/**
 * @swagger
 * /api/v1/admin/products/{id}/verify:
 *   post:
 *     summary: Verify a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/products/:id/verify', authorize(ROLES.EXHIBITION_ADMIN, ROLES.SUPER_ADMIN), adminController.verifyProduct);

module.exports = router;
