const express = require('express');
const router = express.Router();
const qrPassController = require('../controllers/qrPassController');
const validate = require('../middleware/validate');
const { generateQRPassSchema, validateQRSchema, scanQRSchema, updateQRStatusSchema } = require('../validators/qrPassValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: QRPass
 *   description: QR code generation and validation
 */

/**
 * @swagger
 * /api/v1/qrpasses/validate:
 *   post:
 *     summary: Validate a QR code payload
 *     tags: [QRPass]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: QR is valid
 */
router.post('/validate', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, 'scanner'), validate(validateQRSchema), qrPassController.validateQR);

/**
 * @swagger
 * /api/v1/qrpasses/checkin:
 *   post:
 *     summary: Record check-in from QR scan
 *     tags: [QRPass]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Check-in recorded
 */
router.post('/checkin', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, 'scanner'), validate(scanQRSchema), qrPassController.checkIn);

/**
 * @swagger
 * /api/v1/qrpasses/checkout:
 *   post:
 *     summary: Record check-out from QR scan
 *     tags: [QRPass]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Check-out recorded
 */
router.post('/checkout', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, 'scanner'), validate(scanQRSchema), qrPassController.checkOut);

/**
 * @swagger
 * /api/v1/qrpasses:
 *   post:
 *     summary: Generate a new QR pass
 *     tags: [QRPass]
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
 *         description: QR Pass generated
 */
router.post('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(generateQRPassSchema), qrPassController.generateQRPass);

/**
 * @swagger
 * /api/v1/qrpasses:
 *   get:
 *     summary: Get all QR passes
 *     tags: [QRPass]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of QR passes
 */
router.get('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), qrPassController.getQRPasses);

/**
 * @swagger
 * /api/v1/qrpasses/{id}:
 *   get:
 *     summary: Get QR pass by ID
 *     tags: [QRPass]
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
 *         description: QR Pass details
 */
router.get('/:id', protect, qrPassController.getQRPassById);

/**
 * @swagger
 * /api/v1/qrpasses/{id}/regenerate:
 *   post:
 *     summary: Regenerate QR data for a pass
 *     tags: [QRPass]
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
 *         description: QR Pass regenerated
 */
router.post('/:id/regenerate', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), qrPassController.regenerateQRPass);

/**
 * @swagger
 * /api/v1/qrpasses/{id}/status:
 *   patch:
 *     summary: Update QR pass status (e.g. revoke)
 *     tags: [QRPass]
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
router.patch('/:id/status', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(updateQRStatusSchema), qrPassController.updateStatus);

/**
 * @swagger
 * /api/v1/qrpasses/{id}:
 *   delete:
 *     summary: Delete a QR pass
 *     tags: [QRPass]
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
 *         description: QR pass deleted
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), qrPassController.deleteQRPass);

module.exports = router;
