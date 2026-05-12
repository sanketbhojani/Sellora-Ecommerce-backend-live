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

const router = express.Router();

// ─── PUBLIC ROUTES ────────────────────────────────────────────
router.get("/getPublicSellerProfile/:id",          getPublicSellerProfile);
router.get("/getPublicSellerProducts/:id",         getPublicSellerProducts);

// ─── PROTECTED ROUTES ─────────────────────────────────────────
router.use(protect);
router.use(authorizeRoles("seller"));

// ─── PROFILE ──────────────────────────────────────────────────
router.get("/getSellerProfile",           getSellerProfile);
router.post("/updateSellerProfile",        upload.single("avatar"), updateSellerProfile);
router.delete("/deleteSellerAvatar",      deleteSellerAvatar);

// ─── DASHBOARD ────────────────────────────────────────────────
router.get("/getSellerDashboard",         getSellerDashboard);

// ─── ORDERS ───────────────────────────────────────────────────
router.get("/getSellerOrders",            getSellerOrders);
router.get("/getSellerOrderById/:id",         getSellerOrderById);
router.post("/updateOrderStatus/:id",      updateOrderStatus);

// ─── PRODUCTS ─────────────────────────────────────────────────
router.get("/getSellerProducts",          getSellerProducts);

// ─── PAYMENTS ─────────────────────────────────────────────────
router.get("/getSellerPayments",          getSellerPayments);

// ─── RETURNS ──────────────────────────────────────────────────
router.get("/getSellerReturns",           getSellerReturns);

// ─── REVIEWS ──────────────────────────────────────────────────
router.get("/getSellerReviews",           getSellerReviews);

export default router;