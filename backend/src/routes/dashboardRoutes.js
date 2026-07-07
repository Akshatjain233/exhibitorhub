const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dynamic dashboard statistics based on user role
 */

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Get dashboard statistics for the current user's role
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: exhibition
 *         schema:
 *           type: string
 *         description: Exhibition ID (Required for all roles except Super Admin)
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/', protect, dashboardController.getDashboard);

module.exports = router;
