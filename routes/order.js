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
 *     summary: Place a new order (customer only)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
router.post('/placeOrder',authorizeRoles("customer"),placeOrder)

/**
 * @swagger
 * /order/getMyOrders:
 *   get:
 *     summary: Get orders of current customer
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer orders
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
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/getOrderById/:id',authorizeRoles("customer","admin"),getOrderById)

/**
 * @swagger
 * /order/getSellerOrders:
 *   get:
 *     summary: Get orders for current seller
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller order list
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
 *         description: Order stats
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.post('/updateOrderStatus/:id',authorizeRoles("admin"),updateOrderStatus)

export default router;