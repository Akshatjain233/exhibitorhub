const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validate = require('../middleware/validate');
const { createProductSchema, updateProductSchema, updateProductApprovalSchema } = require('../validators/productValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Exhibitor product management
 */

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
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
 *         description: Product created
 */
router.post('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR), validate(createProductSchema), productController.createProduct);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', productController.getProducts);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
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
 *         description: Product updated
 */
router.put('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR), validate(updateProductSchema), productController.updateProduct);

/**
 * @swagger
 * /api/v1/products/{id}/approve:
 *   patch:
 *     summary: Approve or reject a product
 *     tags: [Products]
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
 *         description: Product approval updated
 */
router.patch('/:id/approve', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(updateProductApprovalSchema), productController.updateApprovalStatus);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
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
 *         description: Product deleted
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR), productController.deleteProduct);

module.exports = router;