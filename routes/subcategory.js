import express from "express";
import { addSubcategory, deleteSubcategory, getAllSubcategories, getSubcategoriesByCategory, getSubcategoryById, updateSubcategory } from "../controllers/subcategoryController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import upload from '../middlewares/uploadMiddleware.js'

/**
 * @swagger
 * tags:
 *   name: Subcategory
 *   description: Product subcategory endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /subcategory/getAllSubcategories:
 *   get:
 *     summary: Get all subcategories
 *     tags: [Subcategory]
 *     responses:
 *       200:
 *         description: List of all subcategories
 */
router.get('/getAllSubcategories',getAllSubcategories)

/**
 * @swagger
 * /subcategory/getSubcategoryById/{id}:
 *   get:
 *     summary: Get subcategory by ID
 *     tags: [Subcategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subcategory data
 */
router.get('/getSubcategoryById/:id',getSubcategoryById)

/**
 * @swagger
 * /subcategory/getSubcategoriesByCategory/{id}:
 *   get:
 *     summary: Get subcategories by category ID
 *     tags: [Subcategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Subcategories for the category
 */
router.get('/getSubcategoriesByCategory/:id',getSubcategoriesByCategory)

router.use(protect);

/**
 * @swagger
 * /subcategory/addSubcategory:
 *   post:
 *     summary: Add a new subcategory (admin only)
 *     tags: [Subcategory]
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
 *               categoryId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Subcategory created
 */
router.post('/addSubcategory',authorizeRoles("admin"),upload.single("image"),addSubcategory);

/**
 * @swagger
 * /subcategory/updateSubcategory/{id}:
 *   post:
 *     summary: Update a subcategory (admin only)
 *     tags: [Subcategory]
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
 *         description: Subcategory updated
 */
router.post('/updateSubcategory/:id',authorizeRoles("admin"),upload.single("image"),updateSubcategory)

/**
 * @swagger
 * /subcategory/deleteSubcategory/{id}:
 *   delete:
 *     summary: Delete a subcategory (admin only)
 *     tags: [Subcategory]
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
 *         description: Subcategory deleted
 */
router.delete('/deleteSubcategory/:id',authorizeRoles("admin"),deleteSubcategory)

export default router;