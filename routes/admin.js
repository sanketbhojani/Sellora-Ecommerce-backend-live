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

router.use(protect);
router.use(authorizeRoles("admin"));

// ─── DASHBOARD ────────────────────────────────────────────────
router.get("/getDashboardStats",                 getDashboardStats);

router.post("/activateUser/:id",activateUser)
router.post("/deactivateUser/:id",deactivateUser)

// ─── CUSTOMER MANAGEMENT ─────────────────────────────────────
router.get("/getAllCustomers",              getAllCustomers);
router.post("/toggleUserStatus/:id",              toggleUserStatus);

// ─── SELLER MANAGEMENT ───────────────────────────────────────
router.get("/getAllSellers",                getAllSellers);
router.get("/getSellerById/:id",               getSellerById);
router.post("/approveSeller/:id",           approveSeller);
router.post("/rejectSeller/:id",            rejectSeller);

// ─── PRODUCT MANAGEMENT ──────────────────────────────────────
router.get("/getAllProductsAdmin",               getAllProductsAdmin);
router.get("/getInactiveProduct",          getInactiveProduct);
router.get("/getProductsBySeller/:sellerId", getProductsBySeller);
router.post("/activeProduct/:id",          activeProduct);
router.post("/deactiveProduct/:id",           deactiveProduct);

// ─── ORDER MANAGEMENT ────────────────────────────────────────
router.get("/getAllOrders",                 getAllOrders);
router.get("/getOrdersBySeller/:sellerId", getOrdersBySeller);

// ─── REVIEW MANAGEMENT ────────────────────────────────────────
router.get("/getAllReviews", getAllReviewsAdmin);

export default router;