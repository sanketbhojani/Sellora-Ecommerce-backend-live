import express from 'express'
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import { addToCart, clearCart, getCart, removeFromCart, updateCartItem } from '../controllers/cartController.js';

const router  = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart endpoints (customer only)
 */

router.use(protect);
router.use(authorizeRoles("customer"));

/**
 * @swagger
 * /cart/getCart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart items returned
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
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product added to cart
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart item updated
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
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product removed from cart
 */
router.delete('/removeFromCart/:productId',removeFromCart)

/**
 * @swagger
 * /cart/clearCart:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete('/clearCart',clearCart)
export default router;