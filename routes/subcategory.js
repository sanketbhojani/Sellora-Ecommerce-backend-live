import express from "express";
import { addSubcategory, deleteSubcategory, getAllSubcategories, getSubcategoriesByCategory, getSubcategoryById, updateSubcategory } from "../controllers/subcategoryController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import upload from '../middlewares/uploadMiddleware.js'


const router = express.Router();

// ✅ PUBLIC routes (no auth needed)
router.get('/getAllSubcategories',getAllSubcategories)
router.get('/getSubcategoryById/:id',getSubcategoryById) // subcategory id give
router.get('/getSubcategoriesByCategory/:id',getSubcategoriesByCategory) // category id give

// ✅ PROTECTED routes (admin only)
router.use(protect);

router.post('/addSubcategory',authorizeRoles("admin"),upload.single("image"),addSubcategory);
router.post('/updateSubcategory/:id',authorizeRoles("admin"),upload.single("image"),updateSubcategory)  // subcategory Id
router.delete('/deleteSubcategory/:id',authorizeRoles("admin"),deleteSubcategory)  // subcategory Id





export default router;