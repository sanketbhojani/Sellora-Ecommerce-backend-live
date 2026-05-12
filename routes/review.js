import express from 'express'
import { addReview, deleteReview, deleteReviewByAdmin, getMyReviews, getProductReviews, updateReview } from '../controllers/reviewController.js';
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Product review endpoints
 */

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /review/addReview:
 *   post:
 *     summary: Add a product review (customer only)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Review added
 */
router.post('/addReview',authorizeRoles("customer"),upload.array("images",3),addReview)

/**
 * @swagger
 * /review/updateReview/{id}:
 *   post:
 *     summary: Update a review (customer only)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Review updated
 */
router.post('/updateReview/:id',authorizeRoles("customer"),upload.array("images",3),updateReview)

/**
 * @swagger
 * /review/deleteReview/{id}:
 *   delete:
 *     summary: Delete own review (customer only)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete('/deleteReview/:id',authorizeRoles("customer"),deleteReview)

/**
 * @swagger
 * /review/deleteReviewByAdmin/{id}:
 *   delete:
 *     summary: Delete any review (admin only)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted by admin
 */
router.delete('/deleteReviewByAdmin/:id',authorizeRoles("admin"),deleteReviewByAdmin)

/**
 * @swagger
 * /review/getProductReviews/{productId}:
 *   get:
 *     summary: Get reviews for a product
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product reviews
 */
router.get('/getProductReviews/:productId',getProductReviews)

/**
 * @swagger
 * /review/getMyReviews:
 *   get:
 *     summary: Get current customer's reviews
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer reviews
 */
router.get('/getMyReviews',authorizeRoles("customer"),getMyReviews)

export default router;
