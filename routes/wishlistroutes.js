import express from 'express'
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import { getWishlist,toggleWishlist,checkWishlist,clearWishlist } from '../controllers/Wishlistcontroller.js';

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management (customer only)
 */

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("customer"));

/**
 * @swagger
 * /wishlist/getWishlist:
 *   get:
 *     summary: Get customer's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist items
 */
router.get('/getWishlist',getWishlist)

/**
 * @swagger
 * /wishlist/checkWishlist/{productId}:
 *   get:
 *     summary: Check if product is in wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wishlist check result
 */
router.get('/checkWishlist/:productId',checkWishlist)

/**
 * @swagger
 * /wishlist/toggleWishlist/{productId}:
 *   post:
 *     summary: Toggle product in wishlist (add/remove)
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wishlist toggled
 */
router.post('/toggleWishlist/:productId',toggleWishlist)

/**
 * @swagger
 * /wishlist/clearWishlist:
 *   delete:
 *     summary: Clear entire wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared
 */
router.delete('/clearWishlist',clearWishlist)

export default router;