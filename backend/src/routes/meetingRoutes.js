const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const validate = require('../middleware/validate');
const { requestMeetingSchema, updateMeetingStatusSchema, updateMeetingSchema } = require('../validators/meetingValidator');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: Networking and meeting management
 */

/**
 * @swagger
 * /api/v1/meetings:
 *   post:
 *     summary: Request a meeting with another user
 *     tags: [Meetings]
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
 *         description: Meeting requested
 */
router.post('/', protect, validate(requestMeetingSchema), meetingController.requestMeeting);

/**
 * @swagger
 * /api/v1/meetings:
 *   get:
 *     summary: Get meetings
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of meetings
 */
router.get('/', protect, meetingController.getMeetings);

/**
 * @swagger
 * /api/v1/meetings/{id}:
 *   get:
 *     summary: Get meeting by ID
 *     tags: [Meetings]
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
 *         description: Meeting details
 */
router.get('/:id', protect, meetingController.getMeetingById);

/**
 * @swagger
 * /api/v1/meetings/{id}/status:
 *   patch:
 *     summary: Accept, decline or cancel a meeting
 *     tags: [Meetings]
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
router.patch('/:id/status', protect, validate(updateMeetingStatusSchema), meetingController.updateMeetingStatus);

/**
 * @swagger
 * /api/v1/meetings/{id}:
 *   put:
 *     summary: Update meeting schedule or location
 *     tags: [Meetings]
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
 *         description: Meeting updated
 */
router.put('/:id', protect, validate(updateMeetingSchema), meetingController.updateMeetingDetails);

/**
 * @swagger
 * /api/v1/meetings/{id}:
 *   delete:
 *     summary: Delete a meeting request
 *     tags: [Meetings]
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
 *         description: Meeting deleted
 */
router.delete('/:id', protect, meetingController.deleteMeeting);

module.exports = router;
