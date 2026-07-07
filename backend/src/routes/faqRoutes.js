const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const validate = require('../middleware/validate');
const { createFAQSchema, updateFAQSchema, reorderFAQSchema } = require('../validators/faqValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: Frequently Asked Questions
 */

/**
 * @swagger
 * /api/v1/faqs:
 *   post:
 *     summary: Create an FAQ
 *     tags: [FAQs]
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
 *         description: FAQ created
 */
router.post('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(createFAQSchema), faqController.createFAQ);

/**
 * @swagger
 * /api/v1/faqs:
 *   get:
 *     summary: Get all FAQs
 *     tags: [FAQs]
 *     responses:
 *       200:
 *         description: List of FAQs
 */
router.get('/', faqController.getFAQs);

/**
 * @swagger
 * /api/v1/faqs/reorder:
 *   patch:
 *     summary: Reorder FAQs
 *     tags: [FAQs]
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
 *         description: FAQs reordered
 */
router.patch('/reorder', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(reorderFAQSchema), faqController.reorderFAQs);

/**
 * @swagger
 * /api/v1/faqs/{id}:
 *   get:
 *     summary: Get FAQ by ID
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ details
 */
router.get('/:id', faqController.getFAQById);

/**
 * @swagger
 * /api/v1/faqs/{id}:
 *   put:
 *     summary: Update an FAQ
 *     tags: [FAQs]
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
 *         description: FAQ updated
 */
router.put('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(updateFAQSchema), faqController.updateFAQ);

/**
 * @swagger
 * /api/v1/faqs/{id}:
 *   delete:
 *     summary: Delete an FAQ
 *     tags: [FAQs]
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
 *         description: FAQ deleted
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), faqController.deleteFAQ);

module.exports = router;
