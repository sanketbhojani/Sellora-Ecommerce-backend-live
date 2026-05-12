import express from "express";
import {
    getDashboardStats,
    getAllCustomers,
    getAllSellers,
    getSellerById,
    approveSeller,
    rejectSeller,
    toggleUserStatus,
    getAllProductsAdmin,
    getProductsBySeller,
    getAllOrders,
    getOrdersBySeller,
    deactivateUser,
    activateUser,
    activeProduct,
    deactiveProduct,
    getInactiveProduct,
    getAllReviewsAdmin,
} from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints (admin role required)
 */

router.use(protect);
router.use(authorizeRoles("admin"));

/**
 * @swagger
 * /admin/getDashboardStats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats returned successfully
 */
router.get("/getDashboardStats", getDashboardStats);

/**
 * @swagger
 * /admin/activateUser/{id}:
 *   post:
 *     summary: Activate a user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User activated
 */
router.post("/activateUser/:id",activateUser)

/**
 * @swagger
 * /admin/deactivateUser/{id}:
 *   post:
 *     summary: Deactivate a user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated
 */
router.post("/deactivateUser/:id",deactivateUser)

/**
 * @swagger
 * /admin/getAllCustomers:
 *   get:
 *     summary: Get all customers
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all customers
 */
router.get("/getAllCustomers", getAllCustomers);

/**
 * @swagger
 * /admin/toggleUserStatus/{id}:
 *   post:
 *     summary: Toggle user active/inactive status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User status toggled
 */
router.post("/toggleUserStatus/:id", toggleUserStatus);

/**
 * @swagger
 * /admin/getAllSellers:
 *   get:
 *     summary: Get all sellers
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all sellers
 */
router.get("/getAllSellers", getAllSellers);

/**
 * @swagger
 * /admin/getSellerById/{id}:
 *   get:
 *     summary: Get a seller by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller data
 */
router.get("/getSellerById/:id", getSellerById);

/**
 * @swagger
 * /admin/approveSeller/{id}:
 *   post:
 *     summary: Approve a seller account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller approved
 */
router.post("/approveSeller/:id", approveSeller);

/**
 * @swagger
 * /admin/rejectSeller/{id}:
 *   post:
 *     summary: Reject a seller account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller rejected
 */
router.post("/rejectSeller/:id", rejectSeller);

/**
 * @swagger
 * /admin/getAllProductsAdmin:
 *   get:
 *     summary: Get all products (admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
 */
router.get("/getAllProductsAdmin", getAllProductsAdmin);

/**
 * @swagger
 * /admin/getInactiveProduct:
 *   get:
 *     summary: Get all inactive products
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inactive products
 */
router.get("/getInactiveProduct", getInactiveProduct);

/**
 * @swagger
 * /admin/getProductsBySeller/{sellerId}:
 *   get:
 *     summary: Get all products by a specific seller
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Products by seller
 */
router.get("/getProductsBySeller/:sellerId", getProductsBySeller);

/**
 * @swagger
 * /admin/activeProduct/{id}:
 *   post:
 *     summary: Activate a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product activated
 */
router.post("/activeProduct/:id", activeProduct);

/**
 * @swagger
 * /admin/deactiveProduct/{id}:
 *   post:
 *     summary: Deactivate a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deactivated
 */
router.post("/deactiveProduct/:id", deactiveProduct);

/**
 * @swagger
 * /admin/getAllOrders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get("/getAllOrders", getAllOrders);

/**
 * @swagger
 * /admin/getOrdersBySeller/{sellerId}:
 *   get:
 *     summary: Get orders by seller
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Orders by seller
 */
router.get("/getOrdersBySeller/:sellerId", getOrdersBySeller);

/**
 * @swagger
 * /admin/getAllReviews:
 *   get:
 *     summary: Get all reviews (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reviews
 */
router.get("/getAllReviews", getAllReviewsAdmin);

export default router;