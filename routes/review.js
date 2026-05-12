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
 *     summary: Add a review for a delivered product (customer only)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [productId, orderId, rating]
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 664a1b2c3d4e5f6789012345
 *               orderId:
 *                 type: string
 *                 example: 664a1b2c3d4e5f6789012346
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Great product, fast delivery!
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Review added successfully
 *       400:
 *         description: Missing fields / Already reviewed
 *       403:
 *         description: Can only review from delivered orders
 */
router.post('/addReview',authorizeRoles("customer"),upload.array("images",3),addReview)

/**
 * @swagger
 * /review/updateReview/{id}:
 *   post:
 *     summary: Update own review (customer only)
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
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Updated review comment
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Review updated
 *       404:
 *         description: Review not found
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
 *       404:
 *         description: Review not found
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
 *       404:
 *         description: Review not found
 */
router.delete('/deleteReviewByAdmin/:id',authorizeRoles("admin"),deleteReviewByAdmin)

/**
 * @swagger
 * /review/getProductReviews/{productId}:
 *   get:
 *     summary: Get reviews for a product (with pagination & rating filter)
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *           enum: [1, 2, 3, 4, 5]
 *     responses:
 *       200:
 *         description: Reviews fetched with rating breakdown
 */
router.get('/getProductReviews/:productId',getProductReviews)

/**
 * @swagger
 * /review/getMyReviews:
 *   get:
 *     summary: Get all reviews written by current customer
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer reviews list
 */
router.get('/getMyReviews',authorizeRoles("customer"),getMyReviews)

export default router;
