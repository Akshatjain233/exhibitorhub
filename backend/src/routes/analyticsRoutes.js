const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const validate = require('../middleware/validate');
const { trackViewSchema } = require('../validators/analyticsValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Tracking and analytics
 */

/**
 * @swagger
 * /api/v1/analytics/track:
 *   post:
 *     summary: Track a page view or interaction
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tracked
 */
// Optional protect - if token is present, we record the user, otherwise anonymous
// To support both, we can make a custom middleware or just use a passive auth middleware. 
// For now, let's assume it requires login, or we can write a passive auth.
// Let's use a standard route without full block, but pass token if available:
router.post('/track', validate(trackViewSchema), (req, res, next) => {
  // Passive Auth attempt
  const jwt = require('jsonwebtoken');
  const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
    ? req.headers.authorization.split(' ')[1] 
    : null;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, role: decoded.role };
    } catch(err) {
      // ignore
    }
  }
  next();
}, analyticsController.trackView);

/**
 * @swagger
 * /api/v1/analytics:
 *   get:
 *     summary: Get analytics dashboard
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: exhibition
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR), analyticsController.getAnalytics);

module.exports = router;
