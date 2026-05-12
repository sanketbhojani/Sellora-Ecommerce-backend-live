import express from "express";
import {
    getSellerProfile,
    updateSellerProfile,
    deleteSellerAvatar,
    getSellerDashboard,
    getSellerOrders,
    getSellerOrderById,
    updateOrderStatus,
    getSellerProducts,
    getSellerPayments,
    getSellerReturns,
    getSellerReviews,
    getPublicSellerProfile,
    getPublicSellerProducts,
} from "../controllers/sellerController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Seller
 *   description: Seller management endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /seller/getPublicSellerProfile/{id}:
 *   get:
 *     summary: Get public seller profile
 *     tags: [Seller]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Public seller profile
 */
router.get("/getPublicSellerProfile/:id", getPublicSellerProfile);

/**
 * @swagger
 * /seller/getPublicSellerProducts/{id}:
 *   get:
 *     summary: Get products of a public seller
 *     tags: [Seller]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller's product list
 */
router.get("/getPublicSellerProducts/:id", getPublicSellerProducts);

router.use(protect);
router.use(authorizeRoles("seller"));

/**
 * @swagger
 * /seller/getSellerProfile:
 *   get:
 *     summary: Get logged-in seller's profile
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller profile data
 */
router.get("/getSellerProfile", getSellerProfile);

/**
 * @swagger
 * /seller/updateSellerProfile:
 *   post:
 *     summary: Update seller profile
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.post("/updateSellerProfile", upload.single("avatar"), updateSellerProfile);

/**
 * @swagger
 * /seller/deleteSellerAvatar:
 *   delete:
 *     summary: Delete seller avatar
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted
 */
router.delete("/deleteSellerAvatar", deleteSellerAvatar);

/**
 * @swagger
 * /seller/getSellerDashboard:
 *   get:
 *     summary: Get seller dashboard stats
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get("/getSellerDashboard", getSellerDashboard);

/**
 * @swagger
 * /seller/getSellerOrders:
 *   get:
 *     summary: Get seller's orders
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller order list
 */
router.get("/getSellerOrders", getSellerOrders);

/**
 * @swagger
 * /seller/getSellerOrderById/{id}:
 *   get:
 *     summary: Get a specific seller order by ID
 *     tags: [Seller]
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
router.get("/getSellerOrderById/:id", getSellerOrderById);

/**
 * @swagger
 * /seller/updateOrderStatus/{id}:
 *   post:
 *     summary: Update order status (seller)
 *     tags: [Seller]
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
 *         description: Order status updated
 */
router.post("/updateOrderStatus/:id", updateOrderStatus);

/**
 * @swagger
 * /seller/getSellerProducts:
 *   get:
 *     summary: Get all products of logged-in seller
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller product list
 */
router.get("/getSellerProducts", getSellerProducts);

/**
 * @swagger
 * /seller/getSellerPayments:
 *   get:
 *     summary: Get seller's payments
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller payment list
 */
router.get("/getSellerPayments", getSellerPayments);

/**
 * @swagger
 * /seller/getSellerReturns:
 *   get:
 *     summary: Get seller's return requests
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller return list
 */
router.get("/getSellerReturns", getSellerReturns);

/**
 * @swagger
 * /seller/getSellerReviews:
 *   get:
 *     summary: Get reviews on seller's products
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller review list
 */
router.get("/getSellerReviews", getSellerReviews);

export default router;