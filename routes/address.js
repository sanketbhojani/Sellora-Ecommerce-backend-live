import express from "express";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import { addAddress, deleteAddress, getAddressById, getAddresses, setDefaultAddress, updateAddress } from "../controllers/addresscontroller.js";

/**
 * @swagger
 * tags:
 *   name: Address
 *   description: Customer address management (customer only)
 */

const router = express.Router();

router.use(protect,authorizeRoles("customer"));

/**
 * @swagger
 * /address/addAddress:
 *   post:
 *     summary: Add a new address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address added
 */
router.post('/addAddress',addAddress)

/**
 * @swagger
 * /address/getAddresses:
 *   get:
 *     summary: Get all addresses of current customer
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of addresses
 */
router.get('/getAddresses',getAddresses)

/**
 * @swagger
 * /address/getAddressById/{id}:
 *   get:
 *     summary: Get address by ID
 *     tags: [Address]
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
 *         description: Address data
 */
router.get('/getAddressById/:id',getAddressById)

/**
 * @swagger
 * /address/setDefaultAddress/{id}:
 *   post:
 *     summary: Set an address as default
 *     tags: [Address]
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
 *         description: Default address updated
 */
router.post('/setDefaultAddress/:id',setDefaultAddress)

/**
 * @swagger
 * /address/updateAddress/{id}:
 *   post:
 *     summary: Update an address
 *     tags: [Address]
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
 *         description: Address updated
 */
router.post('/updateAddress/:id',updateAddress)

/**
 * @swagger
 * /address/deleteAddress/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Address]
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
 *         description: Address deleted
 */
router.delete('/deleteAddress/:id',deleteAddress)
export default router;