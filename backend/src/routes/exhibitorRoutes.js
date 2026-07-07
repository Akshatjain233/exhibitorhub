const express = require('express');
const router = express.Router();
const exhibitorController = require('../controllers/exhibitorController');
const validate = require('../middleware/validate');
const { createExhibitorSchema, updateExhibitorSchema, assignBoothSchema, updateStatusSchema } = require('../validators/exhibitorValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Exhibitors
 *   description: Exhibitor profile and booth assignment management
 */

/**
 * @swagger
 * /api/v1/exhibitors:
 *   post:
 *     summary: Create an exhibitor profile
 *     tags: [Exhibitors]
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
 *         description: Exhibitor created
 */
router.post('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(createExhibitorSchema), exhibitorController.createExhibitor);

/**
 * @swagger
 * /api/v1/exhibitors:
 *   get:
 *     summary: Get all exhibitors
 *     tags: [Exhibitors]
 *     responses:
 *       200:
 *         description: List of exhibitors
 */
router.get('/', exhibitorController.getExhibitors);

/**
 * @swagger
 * /api/v1/exhibitors/{id}:
 *   get:
 *     summary: Get exhibitor by ID
 *     tags: [Exhibitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exhibitor details
 */
router.get('/:id', exhibitorController.getExhibitorById);

/**
 * @swagger
 * /api/v1/exhibitors/{id}:
 *   put:
 *     summary: Update an exhibitor profile
 *     tags: [Exhibitors]
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
 *         description: Exhibitor updated
 */
router.put('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR), validate(updateExhibitorSchema), exhibitorController.updateExhibitor);

/**
 * @swagger
 * /api/v1/exhibitors/{id}/status:
 *   patch:
 *     summary: Update exhibitor approval status
 *     tags: [Exhibitors]
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
 *         description: Status updated
 */
router.patch('/:id/status', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(updateStatusSchema), exhibitorController.updateStatus);

/**
 * @swagger
 * /api/v1/exhibitors/{id}/assign-booth:
 *   post:
 *     summary: Assign a booth to an exhibitor
 *     tags: [Exhibitors]
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
 *         description: Booth assigned
 */
router.post('/:id/assign-booth', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(assignBoothSchema), exhibitorController.assignBooth);

/**
 * @swagger
 * /api/v1/exhibitors/{id}:
 *   delete:
 *     summary: Delete an exhibitor
 *     tags: [Exhibitors]
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
 *         description: Exhibitor deleted
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), exhibitorController.deleteExhibitor);

module.exports = router;