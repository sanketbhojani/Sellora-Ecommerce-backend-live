import express from 'express'
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import { addToCart, clearCart, getCart, removeFromCart, updateCartItem } from '../controllers/cartController.js';

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart endpoints (customer only)
 */

const router  = express.Router();
router.use(protect);
router.use(authorizeRoles("customer"));

/**
 * @swagger
 * /cart/getCart:
 *   get:
 *     summary: Get current customer's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 */
router.get('/getCart',getCart)

/**
 * @swagger
 * /cart/addToCart:
 *   post:
 *     summary: Add a product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 664a1b2c3d4e5f6789012345
 *               quantity:
 *                 type: number
 *                 default: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product added to cart
 *       400:
 *         description: Invalid product ID / Out of stock
 *       404:
 *         description: Product not found
 */
router.post('/addToCart',addToCart)

/**
 * @swagger
 * /cart/updateCartItem/{productId}:
 *   post:
 *     summary: Update quantity of a cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: 664a1b2c3d4e5f6789012345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       404:
 *         description: Cart or product not found
 */
router.post('/updateCartItem/:productId',updateCartItem)

/**
 * @swagger
 * /cart/removeFromCart/{productId}:
 *   delete:
 *     summary: Remove a product from cart
 *     tags: [Cart]
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
 *         description: Product removed from cart
 */
router.delete('/removeFromCart/:productId',removeFromCart)

/**
 * @swagger
 * /cart/clearCart:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.delete('/clearCart',clearCart)
export default router;