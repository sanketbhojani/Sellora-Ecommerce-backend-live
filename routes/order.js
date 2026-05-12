import express from 'express'
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import { placeOrder,getMyOrders, getOrderById, updateOrderStatus, getSellerOrders, getOrderStats } from '../controllers/orderController.js';

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management endpoints
 */

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /order/placeOrder:
 *   post:
 *     summary: Place a new order from cart (customer only)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressId, paymentMethod, transactionId]
 *             properties:
 *               addressId:
 *                 type: string
 *                 example: 664a1b2c3d4e5f6789012345
 *               paymentMethod:
 *                 type: string
 *                 enum: [online, upi]
 *                 example: upi
 *               transactionId:
 *                 type: string
 *                 example: TXN123456789
 *               couponCode:
 *                 type: string
 *                 example: SAVE20
 *               note:
 *                 type: string
 *                 example: Please deliver in the morning
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Missing fields / Cart empty / Invalid coupon / Out of stock
 */
router.post('/placeOrder',authorizeRoles("customer"),placeOrder)

/**
 * @swagger
 * /order/getMyOrders:
 *   get:
 *     summary: Get current customer's orders (with pagination & filters)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum: [placed, confirmed, processing, shipped, delivered, cancelled]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [paid, refunded]
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 */
router.get('/getMyOrders',authorizeRoles("customer"),getMyOrders)

/**
 * @swagger
 * /order/getOrderById/{id}:
 *   get:
 *     summary: Get order by ID (customer or admin)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       403:
 *         description: Not authorized to view this order
 *       404:
 *         description: Order not found
 */
router.get('/getOrderById/:id',authorizeRoles("customer","admin"),getOrderById)

/**
 * @swagger
 * /order/getSellerOrders:
 *   get:
 *     summary: Get orders containing seller's products
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum: [placed, confirmed, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Seller orders fetched
 */
router.get('/getSellerOrders',authorizeRoles("seller"),getSellerOrders)

/**
 * @swagger
 * /order/getOrderStats:
 *   get:
 *     summary: Get order statistics (admin only)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order stats returned
 */
router.get('/getOrderStats',authorizeRoles("admin"),getOrderStats)

/**
 * @swagger
 * /order/updateOrderStatus/{id}:
 *   post:
 *     summary: Update order status (admin only)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderStatus]
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [placed, confirmed, processing, shipped, delivered, cancelled]
 *                 example: shipped
 *               trackingId:
 *                 type: string
 *                 example: TRK987654321
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status value
 */
router.post('/updateOrderStatus/:id',authorizeRoles("admin"),updateOrderStatus)

export default router;