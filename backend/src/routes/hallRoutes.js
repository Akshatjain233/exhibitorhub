const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const validate = require('../middleware/validate');
const { createHallSchema, updateHallSchema } = require('../validators/hallValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Halls
 *   description: Hall management API
 */

/**
 * @swagger
 * /api/v1/halls:
 *   post:
 *     summary: Create a new hall
 *     tags: [Halls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - venue
 *               - name
 *             properties:
 *               venue:
 *                 type: string
 *                 description: ID of the Venue
 *               name:
 *                 type: string
 *               floor:
 *                 type: string
 *               capacity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Hall created successfully
 */
router.post('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(createHallSchema), hallController.createHall);

/**
 * @swagger
 * /api/v1/halls:
 *   get:
 *     summary: Get all halls
 *     tags: [Halls]
 *     parameters:
 *       - in: query
 *         name: venue
 *         schema:
 *           type: string
 *         description: Filter halls by Venue ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of halls
 */
router.get('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), hallController.getHalls);

/**
 * @swagger
 * /api/v1/halls/{id}:
 *   get:
 *     summary: Get hall by ID
 *     tags: [Halls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hall details
 */
router.get('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), hallController.getHallById);

/**
 * @swagger
 * /api/v1/halls/{id}:
 *   put:
 *     summary: Update a hall
 *     tags: [Halls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Hall updated successfully
 */
router.put('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(updateHallSchema), hallController.updateHall);

/**
 * @swagger
 * /api/v1/halls/{id}:
 *   delete:
 *     summary: Delete a hall
 *     tags: [Halls]
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
 *         description: Hall deleted successfully
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), hallController.deleteHall);

module.exports = router;
