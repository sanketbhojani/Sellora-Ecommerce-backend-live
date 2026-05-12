import express from 'express'
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import { addProduct, deleteProduct, getAllProducts, getMyProducts, getProductById, updateProduct } from '../controllers/productController.js';
import upload from '../middlewares/uploadMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import { createProductSchema, updateProductSchema } from '../validators/productValidator.js';

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /product/getAllProducts:
 *   get:
 *     summary: Get all active products (with filters, search, sort & pagination)
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ObjectId
 *       - in: query
 *         name: subcategoryId
 *         schema:
 *           type: string
 *         description: Filter by subcategory ObjectId
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 12
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: "-price"
 *         description: "Sort field (prefix - for desc). E.g. -price, price, -rating"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, rating, stock]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Products list with pagination
 */
router.get('/getAllProducts',getAllProducts)

/**
 * @swagger
 * /product/getProductById/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.get('/getProductById/:id',getProductById)

router.use(protect);

/**
 * @swagger
 * /product/getMyProducts:
 *   get:
 *     summary: Get seller's own products (seller or admin)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 12
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, stock]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: approvalStatus
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Seller's product list with pagination
 */
router.get('/getMyProducts',authorizeRoles("seller","admin"),getMyProducts)

/**
 * @swagger
 * /product/addProduct:
 *   post:
 *     summary: Add a new product (seller only)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price, categoryId, subcategoryId, stock, images]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Wireless Earbuds
 *               description:
 *                 type: string
 *                 example: High quality wireless earbuds with noise cancellation
 *               price:
 *                 type: number
 *                 example: 1499
 *               originalPrice:
 *                 type: number
 *                 example: 1999
 *               categoryId:
 *                 type: string
 *                 example: 664a1b2c3d4e5f6789012345
 *               subcategoryId:
 *                 type: string
 *                 example: 664a1b2c3d4e5f6789012346
 *               stock:
 *                 type: number
 *                 example: 50
 *               tags:
 *                 type: string
 *                 example: "electronics, wireless, earbuds"
 *                 description: Comma-separated tags
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 5 product images
 *     responses:
 *       201:
 *         description: Product added — pending admin approval
 *       400:
 *         description: Missing fields / Invalid category or subcategory
 */
router.post('/addProduct',authorizeRoles("seller"),upload.array("images",5),validate(createProductSchema),addProduct);

/**
 * @swagger
 * /product/updateProduct/{id}:
 *   post:
 *     summary: Update a product (seller or admin)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               originalPrice:
 *                 type: number
 *               stock:
 *                 type: number
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               categoryId:
 *                 type: string
 *               subcategoryId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated (seller update resets admin approval)
 *       403:
 *         description: Not authorized to update this product
 *       404:
 *         description: Product not found
 */
router.post('/updateProduct/:id',authorizeRoles("seller","admin"),upload.array("images",5),validate(updateProductSchema),updateProduct);

/**
 * @swagger
 * /product/deleteProduct/{id}:
 *   delete:
 *     summary: Delete a product (seller or admin)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       403:
 *         description: Not authorized to delete this product
 *       404:
 *         description: Product not found
 */
router.delete('/deleteProduct/:id',authorizeRoles("seller","admin"),deleteProduct)

export default router;