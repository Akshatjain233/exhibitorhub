const express = require('express');
const router = express.Router();
const boothController = require('../controllers/boothController');
const validate = require('../middleware/validate');
const { createBoothSchema, updateBoothSchema } = require('../validators/boothValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Booths
 *   description: Booth management API
 */

/**
 * @swagger
 * /api/v1/booths/available:
 *   get:
 *     summary: Get available booths
 *     tags: [Booths]
 *     responses:
 *       200:
 *         description: List of available booths
 */
router.get('/available', protect, boothController.getAvailableBooths);

/**
 * @swagger
 * /api/v1/booths/occupied:
 *   get:
 *     summary: Get occupied booths
 *     tags: [Booths]
 *     responses:
 *       200:
 *         description: List of occupied booths
 */
router.get('/occupied', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), boothController.getOccupiedBooths);

/**
 * @swagger
 * /api/v1/booths:
 *   post:
 *     summary: Create a new booth
 *     tags: [Booths]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Booth created successfully
 */
router.post('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(createBoothSchema), boothController.createBooth);

/**
 * @swagger
 * /api/v1/booths:
 *   get:
 *     summary: Get all booths
 *     tags: [Booths]
 *     parameters:
 *       - in: query
 *         name: hall
 *         schema:
 *           type: string
 *         description: Filter booths by Hall ID
 *     responses:
 *       200:
 *         description: List of booths
 */
router.get('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), boothController.getBooths);

/**
 * @swagger
 * /api/v1/booths/{id}:
 *   get:
 *     summary: Get booth by ID
 *     tags: [Booths]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booth details
 */
router.get('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), boothController.getBoothById);

/**
 * @swagger
 * /api/v1/booths/{id}:
 *   put:
 *     summary: Update a booth
 *     tags: [Booths]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booth updated successfully
 */
router.put('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(updateBoothSchema), boothController.updateBooth);

/**
 * @swagger
 * /api/v1/booths/{id}:
 *   delete:
 *     summary: Delete a booth
 *     tags: [Booths]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booth deleted successfully
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), boothController.deleteBooth);

module.exports = router;
