const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const validate = require('../middleware/validate');
const { createPostSchema, updatePostSchema, createCommentSchema } = require('../validators/postValidator');
const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Networking and Feed Posts
 */

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
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
 *         description: Post created
 */
router.post('/', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR), validate(createPostSchema), postController.createPost);

/**
 * @swagger
 * /api/v1/posts/feed:
 *   get:
 *     summary: Get exhibition feed
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feed retrieved
 */
router.get('/feed', protect, postController.getFeed);

/**
 * @swagger
 * /api/v1/posts/my-posts:
 *   get:
 *     summary: Get my posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My posts retrieved
 */
router.get('/my-posts', protect, postController.getMyPosts);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
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
 *         description: Post retrieved
 */
router.get('/:id', protect, postController.getPostById);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
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
 *         description: Post updated
 */
router.put('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR), validate(updatePostSchema), postController.updatePost);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
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
 *         description: Post deleted
 */
router.delete('/:id', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN, ROLES.EXHIBITOR), postController.deletePost);

/**
 * @swagger
 * /api/v1/posts/{id}/like:
 *   post:
 *     summary: Toggle like on a post
 *     tags: [Posts]
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
 *         description: Toggled like
 */
router.post('/:id/like', protect, postController.toggleLike);

/**
 * @swagger
 * /api/v1/posts/{id}/comment:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
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
 *       201:
 *         description: Comment added
 */
router.post('/:id/comment', protect, validate(createCommentSchema), postController.addComment);

/**
 * @swagger
 * /api/v1/posts/{id}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Posts]
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
 *         description: Comments retrieved
 */
router.get('/:id/comments', protect, postController.getComments);

/**
 * @swagger
 * /api/v1/posts/comments/{commentId}/hide:
 *   patch:
 *     summary: Hide a comment (Moderation)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment hidden
 */
router.patch('/comments/:commentId/hide', protect, authorize(ROLES.SUPER_ADMIN, ROLES.EXHIBITION_ADMIN), postController.hideComment);

module.exports = router;
