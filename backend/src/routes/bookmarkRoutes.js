const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const validate = require('../middleware/validate');
const { addBookmarkSchema, updateBookmarkSchema } = require('../validators/bookmarkValidator');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Bookmarks
 *   description: User bookmarks
 */

/**
 * @swagger
 * /api/v1/bookmarks:
 *   post:
 *     summary: Add a bookmark
 *     tags: [Bookmarks]
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
 *         description: Bookmark added
 */
router.post('/', protect, validate(addBookmarkSchema), bookmarkController.addBookmark);

/**
 * @swagger
 * /api/v1/bookmarks:
 *   get:
 *     summary: Get all user bookmarks
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookmarks
 */
router.get('/', protect, bookmarkController.getBookmarks);

/**
 * @swagger
 * /api/v1/bookmarks/{id}:
 *   put:
 *     summary: Update bookmark notes
 *     tags: [Bookmarks]
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
 *         description: Bookmark updated
 */
router.put('/:id', protect, validate(updateBookmarkSchema), bookmarkController.updateBookmark);

/**
 * @swagger
 * /api/v1/bookmarks/{id}:
 *   delete:
 *     summary: Remove a bookmark
 *     tags: [Bookmarks]
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
 *         description: Bookmark removed
 */
router.delete('/:id', protect, bookmarkController.removeBookmark);

module.exports = router;
