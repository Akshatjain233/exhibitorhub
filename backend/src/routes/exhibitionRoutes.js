const express = require('express');
const router = express.Router();
const exhibitionController = require('../controllers/exhibitionController');
const validate = require('../middleware/validate');
const { createExhibitionSchema, updateExhibitionSchema } = require('../validators/exhibitionValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Exhibitions
 *   description: Exhibition management API
 */

/**
 * @swagger
 * /api/v1/exhibitions:
 *   post:
 *     summary: Create a new exhibition
 *     tags: [Exhibitions]
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
 *         description: Exhibition created successfully
 */
router.post('/', protect, authorize(ROLES.SUPER_ADMIN), validate(createExhibitionSchema), exhibitionController.createExhibition);

/**
 * @swagger
 * /api/v1/exhibitions:
 *   get:
 *     summary: Get all exhibitions
 *     tags: [Exhibitions]
 *     responses:
 *       200:
 *         description: List of exhibitions
 */
router.get('/', exhibitionController.getExhibitions);

/**
 * @swagger
 * /api/v1/exhibitions/{id}:
 *   get:
 *     summary: Get exhibition by ID
 *     tags: [Exhibitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exhibition details
 */
router.get('/:id', exhibitionController.getExhibitionById);

/**
 * @swagger
 * /api/v1/exhibitions/{id}:
 *   put:
 *     summary: Update an exhibition
 *     tags: [Exhibitions]
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
 *         description: Exhibition updated successfully
 */
router.put('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(updateExhibitionSchema), exhibitionController.updateExhibition);

/**
 * @swagger
 * /api/v1/exhibitions/{id}:
 *   delete:
 *     summary: Delete an exhibition
 *     tags: [Exhibitions]
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
 *         description: Exhibition deleted successfully
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN), exhibitionController.deleteExhibition);

module.exports = router;