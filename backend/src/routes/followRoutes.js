const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Follows
 *   description: Networking follow system
 */

/**
 * @swagger
 * /api/v1/follows/{exhibitorId}:
 *   post:
 *     summary: Toggle follow an exhibitor
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exhibitorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow toggled
 */
router.post('/:exhibitorId', protect, followController.toggleFollow);

/**
 * @swagger
 * /api/v1/follows/following:
 *   get:
 *     summary: Get list of exhibitors user is following
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Following list
 */
router.get('/following', protect, followController.getFollowing);

/**
 * @swagger
 * /api/v1/follows/followers:
 *   get:
 *     summary: Get list of followers for an exhibitor
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Followers list
 */
router.get('/followers', protect, followController.getFollowers);

module.exports = router;
