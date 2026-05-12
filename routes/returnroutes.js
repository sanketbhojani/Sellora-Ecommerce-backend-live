import express from 'express'
import { approveReturn, getAllReturns, getMyReturns, getReturnById, getReturnStats, rejectReturn, requestReturn } from '../controllers/returnController.js';
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

/**
 * @swagger
 * tags:
 *   name: Return
 *   description: Product return management endpoints
 */

const router = express.Router();
router.use(protect);

/**
 * @swagger
 * /return/requestReturn:
 *   post:
 *     summary: Request a product return (customer only)
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               reason:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Return request submitted
 */
router.post('/requestReturn',authorizeRoles("customer"),upload.array("images",3),requestReturn)

/**
 * @swagger
 * /return/getMyReturns:
 *   get:
 *     summary: Get customer's return requests
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of return requests
 */
router.get('/getMyReturns',authorizeRoles("customer"),getMyReturns)

/**
 * @swagger
 * /return/getAllReturns:
 *   get:
 *     summary: Get all return requests (admin only)
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All return requests
 */
router.get('/getAllReturns',authorizeRoles("admin"),getAllReturns)

/**
 * @swagger
 * /return/approveReturn/{id}:
 *   post:
 *     summary: Approve a return request (admin only)
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Return ID
 *     responses:
 *       200:
 *         description: Return approved
 */
router.post('/approveReturn/:id',authorizeRoles("admin"),approveReturn)

/**
 * @swagger
 * /return/rejectReturn/{id}:
 *   post:
 *     summary: Reject a return request (admin only)
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Return ID
 *     responses:
 *       200:
 *         description: Return rejected
 */
router.post('/rejectReturn/:id',authorizeRoles("admin"),rejectReturn)

/**
 * @swagger
 * /return/getReturnStats:
 *   get:
 *     summary: Get return statistics (admin only)
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Return stats
 */
router.get('/getReturnStats',authorizeRoles("admin"),getReturnStats)

/**
 * @swagger
 * /return/getReturnById/{id}:
 *   get:
 *     summary: Get return by ID (admin or customer)
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Return ID
 *     responses:
 *       200:
 *         description: Return details
 */
router.get('/getReturnById/:id',authorizeRoles("admin","customer"),getReturnById)

export default router;