const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const validate = require('../middleware/validate');
const { createRegistrationSchema, updateRegistrationStatusSchema } = require('../validators/registrationValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Registration and check-in management
 */

/**
 * @swagger
 * /api/v1/registrations:
 *   post:
 *     summary: Register for an exhibition
 *     tags: [Registrations]
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
 *         description: Registered successfully
 */
router.post('/', protect, validate(createRegistrationSchema), registrationController.register);

/**
 * @swagger
 * /api/v1/registrations:
 *   get:
 *     summary: Get all registrations
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of registrations
 */
router.get('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR), registrationController.getRegistrations);

/**
 * @swagger
 * /api/v1/registrations/{id}:
 *   get:
 *     summary: Get registration by ID
 *     tags: [Registrations]
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
 *         description: Registration details
 */
router.get('/:id', protect, registrationController.getRegistrationById);

/**
 * @swagger
 * /api/v1/registrations/{id}/status:
 *   patch:
 *     summary: Update registration status
 *     tags: [Registrations]
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
router.patch('/:id/status', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(updateRegistrationStatusSchema), registrationController.updateStatus);

/**
 * @swagger
 * /api/v1/registrations/{id}/checkin:
 *   post:
 *     summary: Check-in a registered user
 *     tags: [Registrations]
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
 *         description: Check-in successful
 */
router.post('/:id/checkin', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), registrationController.checkIn);

/**
 * @swagger
 * /api/v1/registrations/{id}:
 *   delete:
 *     summary: Delete a registration
 *     tags: [Registrations]
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
 *         description: Registration deleted
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), registrationController.deleteRegistration);

module.exports = router;
