const express = require('express');
const router = express.Router();
const floorMapController = require('../controllers/floorMapController');
const validate = require('../middleware/validate');
const { createFloorMapSchema, updateFloorMapSchema, assignBoothCoordinatesSchema } = require('../validators/floorMapValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: FloorMaps
 *   description: Interactive Floor Map management
 */

/**
 * @swagger
 * /api/v1/floormaps/hall/{hallId}:
 *   get:
 *     summary: Get floor map by Hall ID
 *     tags: [FloorMaps]
 *     parameters:
 *       - in: path
 *         name: hallId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Floor map details
 */
router.get('/hall/:hallId', protect, floorMapController.getFloorMapByHall);

/**
 * @swagger
 * /api/v1/floormaps/hall/{hallId}/assign-booth:
 *   post:
 *     summary: Assign coordinates to a booth on the floor map
 *     tags: [FloorMaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hallId
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
 *         description: Coordinates assigned
 */
router.post('/hall/:hallId}/assign-booth', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(assignBoothCoordinatesSchema), floorMapController.assignBoothCoordinates);

/**
 * @swagger
 * /api/v1/floormaps:
 *   post:
 *     summary: Upload a new floor map
 *     tags: [FloorMaps]
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
 *         description: Floor map created
 */
router.post('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(createFloorMapSchema), floorMapController.createFloorMap);

/**
 * @swagger
 * /api/v1/floormaps:
 *   get:
 *     summary: Get all floor maps
 *     tags: [FloorMaps]
 *     responses:
 *       200:
 *         description: List of floor maps
 */
router.get('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), floorMapController.getFloorMaps);

/**
 * @swagger
 * /api/v1/floormaps/{id}:
 *   get:
 *     summary: Get floor map by ID
 *     tags: [FloorMaps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Floor map details
 */
router.get('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), floorMapController.getFloorMapById);

/**
 * @swagger
 * /api/v1/floormaps/{id}:
 *   put:
 *     summary: Update a floor map
 *     tags: [FloorMaps]
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
 *         description: Floor map updated
 */
router.put('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), validate(updateFloorMapSchema), floorMapController.updateFloorMap);

/**
 * @swagger
 * /api/v1/floormaps/{id}:
 *   delete:
 *     summary: Delete a floor map
 *     tags: [FloorMaps]
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
 *         description: Floor map deleted
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), floorMapController.deleteFloorMap);

module.exports = router;
