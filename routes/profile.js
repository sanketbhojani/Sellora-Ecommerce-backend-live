import express from "express";
import {
    getProfile,
    updateCustomerProfile,
    updateSellerProfile,
    updateAdminProfile,
    deleteAvatar,
} from "../controllers/profileController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

// ─── GET PROFILE — all roles ──────────────────────────────────
router.get(
    "/getProfile",
    authorizeRoles("customer", "seller", "admin"),
    getProfile
);

// ─── UPDATE PROFILE — role specific ──────────────────────────
router.post(
    "/updateCustomerProfile",
    authorizeRoles("customer"),
    upload.single("avatar"),
    updateCustomerProfile
);

router.post(
    "/updateSellerProfile",
    authorizeRoles("seller"),
    upload.single("avatar"),
    updateSellerProfile
);

router.post(
    "/updateAdminProfile",
    authorizeRoles("admin"),
    upload.single("avatar"),
    updateAdminProfile
);

// ─── DELETE AVATAR — all roles ────────────────────────────────
router.delete(
    "/deleteAvatar",
    authorizeRoles("customer", "seller", "admin"),
    deleteAvatar
);

export default router;