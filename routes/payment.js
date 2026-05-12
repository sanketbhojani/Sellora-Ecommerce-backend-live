import express from "express";
import {
    
    
    
    processRefund,
    getMyPayments,
    getAllPayments,
    getPaymentByOrderId,
    getPaymentStats,
} from "../controllers/paymentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// ─── CUSTOMER ─────────────────────────────────────────────────
router.get("/getMyPayments",            authorizeRoles("customer"),  getMyPayments);
router.get("/getPaymentByOrderId/:orderId",      authorizeRoles("customer"),  getPaymentByOrderId);

// ─── ADMIN ────────────────────────────────────────────────────
router.get("/getAllPayments",            authorizeRoles("admin"),     getAllPayments);
router.post("/processRefund/:paymentId",         authorizeRoles("admin"),     processRefund);
router.get("/getPaymentStats",         authorizeRoles("admin"),     getPaymentStats);

export default router;