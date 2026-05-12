import express from "express";
import {
    processRefund,
    getMyPayments,
    getAllPayments,
    getPaymentByOrderId,
    getPaymentStats,
} from "../controllers/paymentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment management endpoints
 */

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /payment/getMyPayments:
 *   get:
 *     summary: Get payments of current customer
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer payments
 */
router.get("/getMyPayments", authorizeRoles("customer"), getMyPayments);

/**
 * @swagger
 * /payment/getPaymentByOrderId/{orderId}:
 *   get:
 *     summary: Get payment by order ID (customer)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment data for the order
 */
router.get("/getPaymentByOrderId/:orderId", authorizeRoles("customer"), getPaymentByOrderId);

/**
 * @swagger
 * /payment/getAllPayments:
 *   get:
 *     summary: Get all payments (admin only)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All payments
 */
router.get("/getAllPayments", authorizeRoles("admin"), getAllPayments);

/**
 * @swagger
 * /payment/processRefund/{paymentId}:
 *   post:
 *     summary: Process a refund (admin only)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Refund processed
 */
router.post("/processRefund/:paymentId", authorizeRoles("admin"), processRefund);

/**
 * @swagger
 * /payment/getPaymentStats:
 *   get:
 *     summary: Get payment statistics (admin only)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment stats
 */
router.get("/getPaymentStats", authorizeRoles("admin"), getPaymentStats);

export default router;