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
    getAllAdmins,
    deleteAdmin,
    updateAdmin,
    addProductAdmin,
    updateProductAdmin,
    deleteProductAdmin,
    softDeleteProductAdmin,
    toggleProductStatusAdmin,
    getProductByIdAdmin,
} from "../controllers/adminController.js";
import { registerAdmin } from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from '../middlewares/uploadMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import { createProductAdminSchema, updateProductSchema } from '../validators/productValidator.js';
import { getOrderStats, updateOrderStatus } from "../controllers/orderController.js";
import { getAllPayments, getPaymentStats, processRefund } from "../controllers/paymentController.js";
import { getAllReturns, getReturnStats, approveReturn, rejectReturn } from "../controllers/returnController.js";

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
router.post("/activateUser/:id", activateUser)

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
router.post("/deactivateUser/:id", deactivateUser)

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
 * /admin/product/add:
 *   post:
 *     summary: Add a new product (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price, categoryId, subcategoryId, stock, images]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               originalPrice:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               subcategoryId:
 *                 type: string
 *               stock:
 *                 type: number
 *               tags:
 *                 type: string
 *               sellerId:
 *                 type: string
 *                 description: Optional seller ID to associate product with
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post("/product/add", upload.array("images", 5), validate(createProductAdminSchema), addProductAdmin);

/**
 * @swagger
 * /admin/product/update/{id}:
 *   post:
 *     summary: Update any product (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               originalPrice:
 *                 type: number
 *               stock:
 *                 type: number
 *               tags:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               subcategoryId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.post("/product/update/:id", upload.array("images", 5), validate(updateProductSchema), updateProductAdmin);

/**
 * @swagger
 * /admin/product/delete/{id}:
 *   delete:
 *     summary: Hard delete any product (Admin)
 *     tags: [Admin]
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
 *         description: Product hard deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete("/product/delete/:id", deleteProductAdmin);

/**
 * @swagger
 * /admin/product/soft-delete/{id}:
 *   delete:
 *     summary: Soft delete any product (Admin)
 *     tags: [Admin]
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
 *         description: Product soft deleted successfully
 *       400:
 *         description: Product is already soft deleted
 *       404:
 *         description: Product not found
 */
router.delete("/product/soft-delete/:id", softDeleteProductAdmin);

/**
 * @swagger
 * /admin/product/toggle-status/{id}:
 *   post:
 *     summary: Toggle active/inactive status of any product (Admin)
 *     tags: [Admin]
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
 *         description: Product status toggled successfully
 *       404:
 *         description: Product not found
 */
router.post("/product/toggle-status/:id", toggleProductStatusAdmin);

/**
 * @swagger
 * /admin/product/{id}:
 *   get:
 *     summary: Get detailed product info (Admin)
 *     tags: [Admin]
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
 *         description: Product details
 */
router.get("/product/:id", getProductByIdAdmin);


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

/**
 * @swagger
 * /admin/admins:
 *   get:
 *     summary: Get all admins
 *     description: Returns a paginated list of all administrators. (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of all admins
 *       401:
 *         description: Unauthorized
 */
router.get("/admins", getAllAdmins);

/**
 * @swagger
 * /admin/admins/add:
 *   post:
 *     summary: Create a new admin account
 *     description: Creates a new administrator and sends an OTP verification email. (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword, phone]
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Admin
 *               email:
 *                 type: string
 *                 example: newadmin@sellora.com
 *               password:
 *                 type: string
 *                 example: admin123
 *               confirmPassword:
 *                 type: string
 *                 example: admin123
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               isSuperAdmin:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Admin created successfully. OTP sent to email.
 *       400:
 *         description: All fields required / Passwords do not match / Email already registered
 */
router.post("/admins/add", registerAdmin);

/**
 * @swagger
 * /admin/admins/{id}:
 *   delete:
 *     summary: Delete an admin account
 *     description: Permanently deletes an administrator account. (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       400:
 *         description: Cannot delete your own account
 *       404:
 *         description: Admin not found
 */
router.delete("/admins/:id", deleteAdmin);

/**
 * @swagger
 * /admin/admins/update/{id}:
 *   post:
 *     summary: Update an admin account
 *     description: Updates an administrator's details. (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               isSuperAdmin:
 *                 type: boolean
 *               permissions:
 *                 type: object
 *                 properties:
 *                   manageProducts:
 *                     type: boolean
 *                   manageSellers:
 *                     type: boolean
 *                   manageOrders:
 *                     type: boolean
 *                   manageCustomers:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       404:
 *         description: Admin not found
 */
router.post("/admins/update/:id", updateAdmin);

/**
 * @swagger
 * /admin/getOrderStats:
 *   get:
 *     summary: Get overall order statistics (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
 */
router.get("/getOrderStats", getOrderStats);

/**
 * @swagger
 * /admin/updateOrderStatus/{id}:
 *   post:
 *     summary: Update the status of an order (Admin)
 *     tags: [Admin]
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
 *               trackingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.post("/updateOrderStatus/:id", updateOrderStatus);

/**
 * @swagger
 * /admin/getAllPayments:
 *   get:
 *     summary: Get all payments (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all payments
 */
router.get("/getAllPayments", getAllPayments);

/**
 * @swagger
 * /admin/getPaymentStats:
 *   get:
 *     summary: Get overall payment statistics (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics retrieved successfully
 */
router.get("/getPaymentStats", getPaymentStats);

/**
 * @swagger
 * /admin/processRefund/{paymentId}:
 *   post:
 *     summary: Process a refund for a payment (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refundAmount:
 *                 type: number
 *               refundReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund processed successfully
 */
router.post("/processRefund/:paymentId", processRefund);

/**
 * @swagger
 * /admin/getAllReturns:
 *   get:
 *     summary: Get all return requests (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all returns
 */
router.get("/getAllReturns", getAllReturns);

/**
 * @swagger
 * /admin/getReturnStats:
 *   get:
 *     summary: Get overall return statistics (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Return statistics retrieved successfully
 */
router.get("/getReturnStats", getReturnStats);

/**
 * @swagger
 * /admin/approveReturn/{id}:
 *   post:
 *     summary: Approve a return request and process refund (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Return ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refundNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Return approved and refunded
 */
router.post("/approveReturn/:id", approveReturn);

/**
 * @swagger
 * /admin/rejectReturn/{id}:
 *   post:
 *     summary: Reject a return request (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Return ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rejectedReason]
 *             properties:
 *               rejectedReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Return request rejected successfully
 */
router.post("/rejectReturn/:id", rejectReturn);

export default router;