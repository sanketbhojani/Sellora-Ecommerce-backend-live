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
 *     summary: Apply a coupon code (customer only)
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
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       400:
 *         description: Invalid or expired coupon
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
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Coupon created
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
 *     responses:
 *       200:
 *         description: List of all coupons
 */
router.get('/getAllCoupons',authorizeRoles("admin"),getAllCoupons);

/**
 * @swagger
 * /coupon/updateCoupon/{id}:
 *   post:
 *     summary: Update a coupon (admin only)
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
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
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon deleted
 */
router.delete('/deleteCoupon/:id',authorizeRoles("admin"),deleteCoupon);

/**
 * @swagger
 * /coupon/toggleCouponStatus/{id}:
 *   post:
 *     summary: Toggle coupon active/inactive status (admin only)
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon status toggled
 */
router.post('/toggleCouponStatus/:id',authorizeRoles("admin"),toggleCouponStatus);

export default router;