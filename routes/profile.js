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

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management endpoints
 */

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /profile/getProfile:
 *   get:
 *     summary: Get current user's profile (all roles)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authenticated
 */
router.get(
    "/getProfile",
    authorizeRoles("customer", "seller", "admin"),
    getProfile
);

/**
 * @swagger
 * /profile/updateCustomerProfile:
 *   post:
 *     summary: Update customer profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Customer profile updated
 */
router.post(
    "/updateCustomerProfile",
    authorizeRoles("customer"),
    upload.single("avatar"),
    updateCustomerProfile
);

/**
 * @swagger
 * /profile/updateSellerProfile:
 *   post:
 *     summary: Update seller profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               businessName:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Seller profile updated
 */
router.post(
    "/updateSellerProfile",
    authorizeRoles("seller"),
    upload.single("avatar"),
    updateSellerProfile
);

/**
 * @swagger
 * /profile/updateAdminProfile:
 *   post:
 *     summary: Update admin profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Admin profile updated
 */
router.post(
    "/updateAdminProfile",
    authorizeRoles("admin"),
    upload.single("avatar"),
    updateAdminProfile
);

/**
 * @swagger
 * /profile/deleteAvatar:
 *   delete:
 *     summary: Delete current user's avatar (all roles)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 */
router.delete(
    "/deleteAvatar",
    authorizeRoles("customer", "seller", "admin"),
    deleteAvatar
);

export default router;