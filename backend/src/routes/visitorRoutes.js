const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const validate = require('../middleware/validate');
const { createVisitorSchema, updateVisitorSchema } = require('../validators/visitorValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Visitors
 *   description: Visitor profile management
 */

/**
 * @swagger
 * /api/v1/visitors:
 *   post:
 *     summary: Create a visitor profile
 *     tags: [Visitors]
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
 *         description: Visitor created
 */
router.post('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.VISITOR), validate(createVisitorSchema), visitorController.createVisitor);

/**
 * @swagger
 * /api/v1/visitors:
 *   get:
 *     summary: Get all visitors
 *     tags: [Visitors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of visitors
 */
router.get('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR), visitorController.getVisitors);

/**
 * @swagger
 * /api/v1/visitors/{id}:
 *   get:
 *     summary: Get visitor by ID
 *     tags: [Visitors]
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
 *         description: Visitor details
 */
router.get('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR, ROLES.VISITOR), visitorController.getVisitorById);

/**
 * @swagger
 * /api/v1/visitors/{id}:
 *   put:
 *     summary: Update a visitor profile
 *     tags: [Visitors]
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
 *         description: Visitor updated
 */
router.put('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.VISITOR), validate(updateVisitorSchema), visitorController.updateVisitor);

/**
 * @swagger
 * /api/v1/visitors/{id}:
 *   delete:
 *     summary: Delete a visitor
 *     tags: [Visitors]
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
 *         description: Visitor deleted
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), visitorController.deleteVisitor);

module.exports = router;
