import express from "express";
import { addCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/categoryController.js";
import { protect ,authorizeRoles} from "../middlewares/authMiddleware.js";
import upload from '../middlewares/uploadMiddleware.js'

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Product category endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /category/getAllCategories:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List of all categories
 */
router.get('/getAllCategories',getAllCategories);

/**
 * @swagger
 * /category/getCategoryById/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category data
 */
router.get('/getCategoryById/:id',getCategoryById);

router.use(protect);

/**
 * @swagger
 * /category/addCategory:
 *   post:
 *     summary: Add a new category (admin only)
 *     tags: [Category]
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
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/addCategory',authorizeRoles("admin"),upload.single("image"),addCategory);

/**
 * @swagger
 * /category/updateCategory/{id}:
 *   post:
 *     summary: Update a category (admin only)
 *     tags: [Category]
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
 *         description: Category updated
 */
router.post('/updateCategory/:id',authorizeRoles("admin"),upload.single("image"),updateCategory);

/**
 * @swagger
 * /category/deleteCategory/{id}:
 *   delete:
 *     summary: Delete a category (admin only)
 *     tags: [Category]
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
 *         description: Category deleted
 */
router.delete('/deleteCategory/:id',authorizeRoles("admin"),deleteCategory);

export default router;