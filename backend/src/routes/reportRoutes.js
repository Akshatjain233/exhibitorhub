const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Exportable data reports
 */

/**
 * @swagger
 * /api/v1/reports/registrations:
 *   get:
 *     summary: Generate registration report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: exhibition
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, pdf]
 *     responses:
 *       200:
 *         description: Report generated
 */
router.get('/registrations', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), reportController.getRegistrationReport);

/**
 * @swagger
 * /api/v1/reports/leads:
 *   get:
 *     summary: Generate leads report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: exhibition
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, pdf]
 *     responses:
 *       200:
 *         description: Report generated
 */
router.get('/leads', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR), reportController.getLeadsReport);

module.exports = router;
