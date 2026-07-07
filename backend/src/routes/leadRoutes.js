const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const validate = require('../middleware/validate');
const { scanLeadSchema, updateLeadSchema } = require('../validators/leadValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Exhibitor lead scanning and management
 */

/**
 * @swagger
 * /api/v1/leads/scan:
 *   post:
 *     summary: Scan a visitor QR pass
 *     tags: [Leads]
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
 *         description: Lead captured
 */
router.post('/scan', protect, authorize(ROLES.EXHIBITOR, ROLES.SUPER_ADMIN), validate(scanLeadSchema), leadController.scanLead);

/**
 * @swagger
 * /api/v1/leads/stats:
 *   get:
 *     summary: Get lead statistics
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lead statistics
 */
router.get('/stats', protect, authorize(ROLES.EXHIBITOR, ROLES.EXHIBITION_ADMIN, ROLES.SUPER_ADMIN), leadController.getDashboardStats);

/**
 * @swagger
 * /api/v1/leads/export:
 *   get:
 *     summary: Export leads to CSV/JSON
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lead export
 */
router.get('/export', protect, authorize(ROLES.EXHIBITOR, ROLES.EXHIBITION_ADMIN, ROLES.SUPER_ADMIN), leadController.exportLeads);

/**
 * @swagger
 * /api/v1/leads:
 *   get:
 *     summary: Get all captured leads
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leads
 */
router.get('/', protect, authorize(ROLES.EXHIBITOR, ROLES.EXHIBITION_ADMIN, ROLES.SUPER_ADMIN), leadController.getLeads);

/**
 * @swagger
 * /api/v1/leads/{id}:
 *   get:
 *     summary: Get lead by ID
 *     tags: [Leads]
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
 *         description: Lead details
 */
router.get('/:id', protect, authorize(ROLES.EXHIBITOR, ROLES.EXHIBITION_ADMIN, ROLES.SUPER_ADMIN), leadController.getLeadById);

/**
 * @swagger
 * /api/v1/leads/{id}:
 *   put:
 *     summary: Update lead details (notes, qualification)
 *     tags: [Leads]
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
 *         description: Lead updated
 */
router.put('/:id', protect, authorize(ROLES.EXHIBITOR, ROLES.SUPER_ADMIN), validate(updateLeadSchema), leadController.updateLead);

/**
 * @swagger
 * /api/v1/leads/{id}:
 *   delete:
 *     summary: Delete a lead
 *     tags: [Leads]
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
 *         description: Lead deleted
 */
router.delete('/:id', protect, authorize(ROLES.EXHIBITOR, ROLES.SUPER_ADMIN), leadController.deleteLead);

module.exports = router;
