import express from 'express'
import { changePassword, forgotPassword, getMe, initiateManualVerification, login, logout, registerAdmin, registerCustomer, registerSeller, resendOTP, resetPassword, verifyOTP } from '../controllers/authController.js';
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

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
 *           **DEV mode:** The response also contains `data.otp` — copy it directly into the verifyOTP call.
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
 *                       description: "DEV only — copy this for verifyOTP"
 *                       example: "482910"
 *                 message:
 *                   type: string
 *                   example: Registration successful. A verification code has been sent to your email.
 *       400:
 *         description: All fields required / Passwords do not match / User already exists
 */
router.post('/register/registerCustomer', registerCustomer)

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
 *           **DEV mode:** The response also contains `data.otp` — copy it directly into the verifyOTP call.
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
 *           **DEV mode:** The response also contains `data.otp` — copy it directly into the verifyOTP call.
 *       400:
 *         description: Missing fields / Passwords do not match / Email already registered
 *       403:
 *         description: Forbidden - admin role required
 */
router.post('/register/registerAdmin', protect, authorizeRoles("admin"), registerAdmin)

/**
 * @swagger
 * /auth/verifyOTP:
 *   post:
 *     summary: Verify OTP to activate account
 *     description: |
 *       Verifies the 6-digit OTP sent to the user's email during registration.
 *       **How to test:**
 *       1. Register a user → copy `data._id` and `data.otp` from response
 *       2. Paste both here and execute
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
 *                 description: Optional — auto-detected if omitted
 *                 default: customer
 *                 example: customer
 *     responses:
 *       200:
 *         description: Email verified successfully. JWT token returned in cookie.
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
 *       Generates a fresh OTP and sends it to the user's registered email.
 *
 *       **How to test:**
 *       1. Register a user → copy `data._id` from the register response
 *       2. Paste it as `userId` below and execute
 *       3. Copy the `otp` from this response → use in `/auth/verifyOTP`
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
 *                 description: Copy _id from register response
 *                 example: 6a05848d6868e1de7a296497
 *               role:
 *                 type: string
 *                 enum: [customer, seller, admin]
 *                 description: Optional — auto-detected if omitted
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
 *                   description: DEV only — copy this for verifyOTP
 *                   example: "297289"
 *       400:
 *         description: Missing userId / Invalid ObjectId
 *       404:
 *         description: No account found with this ID
 *       500:
 *         description: Email sending failed
 */
router.post('/resendOTP', resendOTP)

/**
 * @swagger
 * /auth/initiateManualVerification:
 *   post:
 *     summary: Initiate manual verification (send OTP by email)
 *     description: |
 *       Sends a verification OTP to an existing but unverified account.
 *       Useful if the user missed the initial registration OTP.
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
 *         description: |
 *           Verification OTP sent.
 *           **DEV mode:** Response contains `otp` and `data.userId` — use both in `/auth/verifyOTP`.
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
 *         description: Already verified or missing email
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
 *         description: Login successful — JWT token returned in cookie and response body
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
 *         description: Current password is incorrect
 */
router.post('/changePassword', protect, changePassword)

/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: Send password reset OTP to email
 *     description: |
 *       Sends a 6-digit reset OTP to the user's registered email.
 *       Auto-detects user type (customer/seller/admin) from email — no role needed.
 *
 *       **How to test:**
 *       1. Enter your registered email below and execute
 *       2. Copy the `otp` from this response
 *       3. Go to `/auth/resetPassword` → paste email + otp + new passwords
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
 *     responses:
 *       200:
 *         description: Password reset OTP sent successfully.
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
 *                   description: DEV only — copy this for resetPassword
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
 *       Completes the password reset process.
 *
 *       **How to test:**
 *       1. Call `/auth/forgotPassword` with your email → copy `otp` from response
 *       2. Fill all fields below and execute
 *       3. Then login with your new password
 *
 *       **Note:** `role` must match the account type (customer / seller / admin).
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
 *                 description: Copy otp from forgotPassword response
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
 *                 description: Must match the account type
 *                 default: customer
 *                 example: customer
 *     responses:
 *       200:
 *         description: Password reset successfully. You can now login with new password.
 *       400:
 *         description: Invalid OTP / OTP expired / Passwords do not match
 *       404:
 *         description: No account found with this email
 */
router.post('/resetPassword', resetPassword)

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

export default router;