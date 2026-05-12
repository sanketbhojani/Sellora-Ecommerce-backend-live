import express from 'express'
import { applyCoupon, createCoupon, deleteCoupon, getAllCoupons, toggleCouponStatus, updateCoupon } from '../controllers/couponController.js';
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';

/**
 * @swagger
 * tags:
 *   name: Coupon
 *   description: Coupon management endpoints
 */

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /coupon/applyCoupon:
 *   post:
 *     summary: Apply a coupon code to cart (customer only)
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: SAVE20
 *     responses:
 *       200:
 *         description: Coupon applied — returns discount details
 *       400:
 *         description: Invalid / expired coupon or empty cart
 */
router.post('/applyCoupon',authorizeRoles("customer"),applyCoupon);

/**
 * @swagger
 * /coupon/createCoupon:
 *   post:
 *     summary: Create a new coupon (admin only)
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discountType, discountValue, expiresAt]
 *             properties:
 *               code:
 *                 type: string
 *                 example: SAVE20
 *               discountType:
 *                 type: string
 *                 enum: [percentage, flat]
 *                 example: percentage
 *               discountValue:
 *                 type: number
 *                 example: 20
 *               minOrderAmount:
 *                 type: number
 *                 example: 500
 *               maxDiscountAmount:
 *                 type: number
 *                 example: 200
 *               usageLimit:
 *                 type: number
 *                 example: 100
 *               expiresAt:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *     responses:
 *       201:
 *         description: Coupon created
 *       400:
 *         description: Duplicate code or invalid value
 */
router.post('/createCoupon',authorizeRoles("admin"),createCoupon);

/**
 * @swagger
 * /coupon/getAllCoupons:
 *   get:
 *     summary: Get all coupons (admin only)
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Coupons list
 */
router.get('/getAllCoupons',authorizeRoles("admin"),getAllCoupons);

/**
 * @swagger
 * /coupon/updateCoupon/{id}:
 *   post:
 *     summary: Update coupon fields (admin only)
 *     tags: [Coupon]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               discountValue:
 *                 type: number
 *               minOrderAmount:
 *                 type: number
 *               expiresAt:
 *                 type: string
 *                 format: date
 *               usageLimit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Coupon updated
 */
router.post('/updateCoupon/:id',authorizeRoles("admin"),updateCoupon);

/**
 * @swagger
 * /coupon/deleteCoupon/{id}:
 *   delete:
 *     summary: Delete a coupon (admin only)
 *     tags: [Coupon]
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
 *         description: Coupon deleted
 */
router.delete('/deleteCoupon/:id',authorizeRoles("admin"),deleteCoupon);

/**
 * @swagger
 * /coupon/toggleCouponStatus/{id}:
 *   post:
 *     summary: Toggle coupon active/inactive (admin only)
 *     tags: [Coupon]
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
 *         description: Status toggled
 */
router.post('/toggleCouponStatus/:id',authorizeRoles("admin"),toggleCouponStatus);

export default router;