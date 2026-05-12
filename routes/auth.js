import express from 'express'
import { changePassword, forgotPassword, getMe, login, logout, registerAdmin, registerCustomer, registerSeller, resendOTP, resetPassword, verifyOTP } from '../controllers/authController.js';
import {  authorizeRoles, protect } from '../middlewares/authMiddleware.js';

const router  = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register/registerCustomer:
 *   post:
 *     summary: Register a new customer
 *     tags: [Auth]
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
 *                 example: Sanket
 *               email:
 *                 type: string
 *                 example: sanket@gmail.com
 *               password:
 *                 type: string
 *                 example: user123
 *               confirmPassword:
 *                 type: string
 *                 example: user123
 *               phone:
 *                 type: string
 *                 example: "9316410977"
 *     responses:
 *       201:
 *         description: |
 *           Customer registered successfully. OTP sent to email.
 *           **DEV mode:** The response also contains `data.otp` with the OTP value for Swagger testing — copy it directly into the verifyOTP call.
 *       400:
 *         description: All fields required / Passwords do not match / User already exists
 */
router.post('/register/registerCustomer',registerCustomer)

/**
 * @swagger
 * /auth/register/registerSeller:
 *   post:
 *     summary: Register a new seller
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword, phone, shopName]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Seller
 *               email:
 *                 type: string
 *                 example: seller@gmail.com
 *               password:
 *                 type: string
 *                 example: seller123
 *               confirmPassword:
 *                 type: string
 *                 example: seller123
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               shopName:
 *                 type: string
 *                 example: My Shop
 *               shopDescription:
 *                 type: string
 *                 example: Best shop in town
 *     responses:
 *       201:
 *         description: |
 *           Seller registered. OTP sent. Awaiting admin approval.
 *           **DEV mode:** The response also contains `data.otp` with the OTP value for Swagger testing — copy it directly into the verifyOTP call.
 *       400:
 *         description: Missing fields / Passwords do not match / Seller already exists
 */
router.post('/register/registerSeller',registerSeller)

/**
 * @swagger
 * /auth/register/registerAdmin:
 *   post:
 *     summary: Register a new admin (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Admin User
 *               email:
 *                 type: string
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 example: admin123
 *               confirmPassword:
 *                 type: string
 *                 example: admin123
 *               phone:
 *                 type: string
 *                 example: "9000000000"
 *               isSuperAdmin:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: |
 *           Admin created. OTP sent to email.
 *           **DEV mode:** The response also contains `data.otp` with the OTP value for Swagger testing — copy it directly into the verifyOTP call.
 *       400:
 *         description: Missing fields / Passwords do not match / Email already registered
 *       403:
 *         description: Forbidden - admin role required
 */
router.post('/register/registerAdmin',protect,authorizeRoles("admin"),registerAdmin)

/**
 * @swagger
 * /auth/verifyOTP:
 *   post:
 *     summary: Verify OTP to activate account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, otp]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 664a1b2c3d4e5f6789012345
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 default: customer
 *                 example: customer
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid OTP / OTP expired / Already verified
 *       404:
 *         description: No account found with this ID
 */
router.post('/verifyOTP',verifyOTP)

/**
 * @swagger
 * /auth/resendOTP:
 *   post:
 *     summary: Resend OTP to registered email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 664a1b2c3d4e5f6789012345
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 default: customer
 *                 example: customer
 *     responses:
 *       200:
 *         description: New OTP sent to email
 *       400:
 *         description: Missing userId / Already verified
 *       404:
 *         description: No account found with this ID
 */
router.post('/resendOTP',resendOTP)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user (customer / seller / admin)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: sanket@gmail.com
 *               password:
 *                 type: string
 *                 example: user123
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 default: customer
 *                 example: customer
 *     responses:
 *       200:
 *         description: Login successful — returns JWT token in cookie
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account deactivated / Not verified / Seller not approved
 */
router.post('/login',login)

/**
 * @swagger
 * /auth/changePassword:
 *   post:
 *     summary: Change password for logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmNewPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldPass123
 *               newPassword:
 *                 type: string
 *                 example: newPass456
 *               confirmNewPassword:
 *                 type: string
 *                 example: newPass456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 */
router.post('/changePassword',protect,changePassword)

/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: Send password reset OTP to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: sanket@gmail.com
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 default: customer
 *                 example: customer
 *     responses:
 *       200:
 *         description: Password reset OTP sent to email
 *       404:
 *         description: No account found with this email
 */
router.post('/forgotPassword',forgotPassword)

/**
 * @swagger
 * /auth/resetPassword:
 *   post:
 *     summary: Reset password using OTP received in email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword, confirmNewPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 example: sanket@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: newPass456
 *               confirmNewPassword:
 *                 type: string
 *                 example: newPass456
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 default: customer
 *                 example: customer
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid OTP / OTP expired / Passwords do not match
 */
router.post('/resetPassword',resetPassword)

/**
 * @swagger
 * /auth/getMe:
 *   get:
 *     summary: Get currently logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data returned
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.get('/getMe',protect,getMe)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user (clears cookie)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 default: customer
 *                 example: customer
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout',logout)
export default router;