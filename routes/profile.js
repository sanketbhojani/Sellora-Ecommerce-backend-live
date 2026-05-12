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
 *   description: User profile management
 */

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /profile/getProfile:
 *   get:
 *     summary: Get logged-in user's profile (all roles)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *       404:
 *         description: User not found
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
 *     summary: Update customer profile (name and/or avatar only)
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
 *                 example: Sanket Bhojani
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Email/phone cannot be changed / Nothing to update
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
 *     summary: Update seller profile (name, shopName, shopDescription, avatar)
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
 *                 example: John Seller
 *               shopName:
 *                 type: string
 *                 example: My Updated Shop
 *               shopDescription:
 *                 type: string
 *                 example: Best electronics store
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Seller profile updated
 *       400:
 *         description: Email/phone cannot be changed / Nothing to update
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
 *     summary: Update admin profile (name, phone, avatar)
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
 *                 example: Admin User
 *               phone:
 *                 type: string
 *                 example: "9000000001"
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Admin profile updated
 *       400:
 *         description: Email cannot be changed / Nothing to update
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
 *         description: Avatar deleted
 *       400:
 *         description: No avatar to delete
 */
router.delete(
    "/deleteAvatar",
    authorizeRoles("customer", "seller", "admin"),
    deleteAvatar
);

export default router;