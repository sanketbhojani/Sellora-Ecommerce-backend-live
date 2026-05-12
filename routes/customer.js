import express from "express";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import { cancelMyOrder, getMyDashboard, getMyOrderById, getMyOrders, trackMyOrder } from "../controllers/customerCtroller.js";

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer self-service endpoints (customer only)
 */

const router = express.Router();

router.use(protect,authorizeRoles("customer"));

/**
 * @swagger
 * /customer/getMyOrders:
 *   get:
 *     summary: Get all orders of current customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer orders
 */
router.get("/getMyOrders",getMyOrders)

/**
 * @swagger
 * /customer/getMyOrderById/{orderId}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 */
router.get("/getMyOrderById/:orderId",getMyOrderById)

/**
 * @swagger
 * /customer/cancelMyOrder/{orderId}:
 *   post:
 *     summary: Cancel an order
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.post("/cancelMyOrder/:orderId",cancelMyOrder)

/**
 * @swagger
 * /customer/trackMyOrder/{orderId}:
 *   get:
 *     summary: Track an order's delivery status
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order tracking info
 */
router.get("/trackMyOrder/:orderId",trackMyOrder)

/**
 * @swagger
 * /customer/getMyDashboard:
 *   get:
 *     summary: Get customer dashboard summary
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer dashboard stats
 */
router.get("/getMyDashboard",getMyDashboard)

export default router;