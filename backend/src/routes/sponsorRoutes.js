const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');
const validate = require('../middleware/validate');
const { createSponsorSchema, updateSponsorSchema } = require('../validators/sponsorValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Sponsors
 *   description: Exhibition sponsor management
 */

/**
 * @swagger
 * /api/v1/sponsors:
 *   post:
 *     summary: Create a sponsor
 *     tags: [Sponsors]
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
 *         description: Sponsor created
 */
router.post('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(createSponsorSchema), sponsorController.createSponsor);

/**
 * @swagger
 * /api/v1/sponsors:
 *   get:
 *     summary: Get all sponsors
 *     tags: [Sponsors]
 *     responses:
 *       200:
 *         description: List of sponsors
 */
router.get('/', sponsorController.getSponsors);

/**
 * @swagger
 * /api/v1/sponsors/{id}:
 *   get:
 *     summary: Get sponsor by ID
 *     tags: [Sponsors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sponsor details
 */
router.get('/:id', sponsorController.getSponsorById);

/**
 * @swagger
 * /api/v1/sponsors/{id}:
 *   put:
 *     summary: Update a sponsor
 *     tags: [Sponsors]
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
 *         description: Sponsor updated
 */
router.put('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(updateSponsorSchema), sponsorController.updateSponsor);

/**
 * @swagger
 * /api/v1/sponsors/{id}:
 *   delete:
 *     summary: Delete a sponsor
 *     tags: [Sponsors]
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
 *         description: Sponsor deleted
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), sponsorController.deleteSponsor);

module.exports = router;