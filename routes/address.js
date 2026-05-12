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
 *     summary: Add a new delivery address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullname, phone, addressLine1, city, state, pincode]
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: Sanket Bhojani
 *               phone:
 *                 type: string
 *                 example: "9316410977"
 *               addressLine1:
 *                 type: string
 *                 example: 12, MG Road
 *               addressLine2:
 *                 type: string
 *                 example: Near City Mall
 *               city:
 *                 type: string
 *                 example: Surat
 *               state:
 *                 type: string
 *                 example: Gujarat
 *               pincode:
 *                 type: string
 *                 example: "395001"
 *               country:
 *                 type: string
 *                 default: India
 *                 example: India
 *               addressType:
 *                 type: string
 *                 enum: [home, work, other]
 *                 default: home
 *                 example: home
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Missing required fields
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
 *         description: Addresses fetched successfully
 */
router.get('/getAddresses',getAddresses)

/**
 * @swagger
 * /address/getAddressById/{id}:
 *   get:
 *     summary: Get a specific address by ID
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address fetched successfully
 *       404:
 *         description: Address not found
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
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Default address updated
 *       404:
 *         description: Address not found
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
 *         description: Address ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               phone:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               country:
 *                 type: string
 *               addressType:
 *                 type: string
 *                 enum: [home, work, other]
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
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
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */
router.delete('/deleteAddress/:id',deleteAddress)
export default router;