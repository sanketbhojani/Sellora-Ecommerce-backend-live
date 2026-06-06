import express from 'express'
import { changePassword, forgetpassword2, forgotPassword, getMe, initiateManualVerification, login, logout, registerAdmin, registerCustomer, registerSeller, resendOTP, resetPassword, resetpassword2, verifyOTP, refreshToken } from '../controllers/authController.js';
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: |
 *     ⚠️ **Render Free Tier Notice:** First request after inactivity takes **30–60 seconds** (cold start).
 *     Please wait — do NOT re-submit. Subsequent requests will be fast.
 */

/**
 * @swagger
 * /auth/register/registerCustomer:
 *   post:
 *     summary: Register a new customer
 *     tags: [Auth]
 *     x-timeout: 120000
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
 *           Customer registered. OTP sent to email.
 *           ✅ **DEV:** Copy `data._id` → use in verifyOTP/resendOTP. Copy `data.otp` → use in verifyOTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6a05848d6868e1de7a296497
 *                     name:
 *                       type: string
 *                       example: Sanket
 *                     email:
 *                       type: string
 *                       example: sanket@gmail.com
 *                     isVerified:
 *                       type: boolean
 *                       example: false
 *                     otp:
 *                       type: string
 *                       description: DEV only — copy into verifyOTP
 *                       example: "482910"
 *                 message:
 *                   type: string
 *                   example: Registration successful. A verification code has been sent to your email.
 *       400:
 *         description: All fields required / Passwords do not match / User already exists
 *       500:
 *         description: Server error or email failed
 */
router.post('/register/registerCustomer', registerCustomer)

/**
 * @swagger
 * /auth/register/registerSeller:
 *   post:
 *     summary: Register a new seller
 *     tags: [Auth]
 *     x-timeout: 120000
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
 *           ✅ **DEV:** Copy `data._id` and `data.otp` → use in verifyOTP.
 *       400:
 *         description: Missing fields / Passwords do not match / Seller already exists
 */
router.post('/register/registerSeller', registerSeller)

/**
 * @swagger
 * /auth/register/registerAdmin:
 *   post:
 *     summary: Register a new admin (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     x-timeout: 120000
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
 *           ✅ **DEV:** Copy `data._id` and `data.otp` → use in verifyOTP.
 *       400:
 *         description: Missing fields / Passwords do not match / Email already registered
 *       403:
 *         description: Forbidden — admin role required
 */
router.post('/register/registerAdmin', protect, authorizeRoles("admin"), registerAdmin)

/**
 * @swagger
 * /auth/verifyOTP:
 *   post:
 *     summary: Verify OTP to activate account
 *     description: |
 *       **How to use:**
 *       1. Call `/auth/register/registerCustomer` → copy `data._id` and `data.otp`
 *       2. Paste `_id` as `userId` and paste `otp` below → Execute
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
 *                 description: Copy _id from register response
 *                 example: 6a05848d6868e1de7a296497
 *               otp:
 *                 type: string
 *                 description: Copy otp from register response
 *                 example: "482910"
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 description: Optional — auto-detected
 *                 default: customer
 *                 example: customer
 *     responses:
 *       200:
 *         description: Email verified. JWT token returned in cookie + response body.
 *       400:
 *         description: Invalid OTP / OTP expired / Already verified
 *       404:
 *         description: No account found with this ID
 */
router.post('/verifyOTP', verifyOTP)

/**
 * @swagger
 * /auth/resendOTP:
 *   post:
 *     summary: Resend OTP to registered email
 *     description: |
 *       **How to use:**
 *       1. Call `/auth/register/registerCustomer` → copy `data._id`
 *       2. Paste as `userId` below → Execute
 *       3. Copy `otp` from this response → use in `/auth/verifyOTP`
 *
 *       ⚠️ On Render free tier first call may take 30–60 sec. Please wait.
 *     tags: [Auth]
 *     x-timeout: 120000
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
 *                 description: Copy _id from register response
 *                 example: 6a05848d6868e1de7a296497
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 description: Optional — auto-detected
 *                 default: customer
 *                 example: customer
 *     responses:
 *       200:
 *         description: New OTP sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: A new OTP has been sent to your email.
 *                 otp:
 *                   type: string
 *                   description: DEV only — copy into verifyOTP
 *                   example: "297289"
 *       400:
 *         description: Missing userId / Invalid ObjectId
 *       404:
 *         description: No account found with this ID
 *       500:
 *         description: Email sending failed — check EMAIL_USER and EMAIL_PASS env vars on Render
 */
router.post('/resendOTP', resendOTP)

/**
 * @swagger
 * /auth/initiateManualVerification:
 *   post:
 *     summary: Send OTP to unverified account by email
 *     description: |
 *       Use this if user missed the OTP during registration.
 *       **How to use:**
 *       1. Enter registered email → Execute
 *       2. Copy `data.userId` and `otp` from response
 *       3. Go to `/auth/verifyOTP` → paste both
 *     tags: [Auth]
 *     x-timeout: 120000
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
 *         description: OTP sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: A verification code has been sent to your email.
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: 6a05848d6868e1de7a296497
 *                     role:
 *                       type: string
 *                       example: customer
 *                 otp:
 *                   type: string
 *                   description: DEV only
 *                   example: "391047"
 *       400:
 *         description: Email already verified / missing email
 *       404:
 *         description: No account found with this email
 */
router.post('/initiateManualVerification', initiateManualVerification)

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
 *         description: Login successful — JWT token in cookie + response body
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account deactivated / Email not verified / Seller not approved
 */
router.post('/login', login)

/**
 * @swagger
 * /auth/changePassword:
 *   post:
 *     summary: Change password (logged-in user only)
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
 *                 example: user123
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
 *         description: Current password is incorrect / Not authenticated
 */
router.post('/changePassword', protect, changePassword)

/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: Send password reset OTP to email
 *     description: |
 *       **How to use:**
 *       1. Enter your registered email → Execute
 *       2. Copy the `otp` from this response
 *       3. Go to `/auth/resetPassword` → paste email + otp + new passwords
 *
 *       ⚠️ On Render free tier first call may take 30–60 sec. Please wait.
 *     tags: [Auth]
 *     x-timeout: 120000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
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
 *         description: Reset OTP sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: A password reset code has been sent to your email.
 *                 otp:
 *                   type: string
 *                   description: DEV only — copy into resetPassword
 *                   example: "391047"
 *       404:
 *         description: No account found with this email
 *       500:
 *         description: Email sending failed
 */
router.post('/forgotPassword', forgotPassword)

/**
 * @swagger
 * /auth/resetPassword:
 *   post:
 *     summary: Reset password using OTP
 *     description: |
 *       **How to use:**
 *       1. Call `/auth/forgotPassword` with email → copy `otp` from response
 *       2. Fill all 5 fields below → Execute
 *       3. Login with new password ✅
 *
 *       ⚠️ `role` must match account type (customer / seller / admin)
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
 *                 description: Copy from forgotPassword response
 *                 example: "391047"
 *               newPassword:
 *                 type: string
 *                 example: newPass456
 *               confirmNewPassword:
 *                 type: string
 *                 example: newPass456
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 description: Must match account type
 *                 default: customer
 *                 example: customer
 *     responses:
 *       200:
 *         description: Password reset successfully. Login with new password.
 *       400:
 *         description: Invalid OTP / OTP expired / Passwords do not match
 *       404:
 *         description: No account found with this email
 */
router.post('/resetPassword', resetPassword)

/**
 * @swagger
 * /auth/forgetpassword2:
 *   post:
 *     summary: Send password reset OTP to email (with explicit role)
 *     tags: [Auth]
 *     x-timeout: 120000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               email:
 *                 type: string
 *                 example: sanket@gmail.com
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 example: customer
 *     responses:
 *       200:
 *         description: Reset OTP sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 otp:
 *                   type: string
 *                   description: DEV only
 *       404:
 *         description: No account found
 *       500:
 *         description: Server error
 */
router.post('/forgetpassword2', forgetpassword2)

/**
 * @swagger
 * /auth/resetpassword2:
 *   post:
 *     summary: Reset password using OTP (Version 2)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role, otp, newPassword, confirmNewPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 example: sanket@gmail.com
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 example: customer
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: newPass123
 *               confirmNewPassword:
 *                 type: string
 *                 example: newPass123
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       400:
 *         description: Invalid OTP / Passwords do not match
 *       404:
 *         description: No account found
 */
router.post('/resetpassword2', resetpassword2)

/**
 * @swagger
 * /auth/getMe:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.get('/getMe', protect, getMe)

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
router.post('/logout', logout)
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Refresh token invalid or expired
 */
router.post('/refresh', refreshToken)

export default router;