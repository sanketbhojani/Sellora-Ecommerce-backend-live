import express from "express";
import { addCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/categoryController.js";
import { protect ,authorizeRoles} from "../middlewares/authMiddleware.js";
import upload from '../middlewares/uploadMiddleware.js'
const router = express.Router();

// ✅ PUBLIC routes (no auth needed)
router.get('/getAllCategories',getAllCategories);
router.get('/getCategoryById/:id',getCategoryById);

// ✅ PROTECTED routes (admin only)
router.use(protect);

router.post('/addCategory',authorizeRoles("admin"),upload.single("image"),addCategory);
router.post('/updateCategory/:id',authorizeRoles("admin"),upload.single("image"),updateCategory);
router.delete('/deleteCategory/:id',authorizeRoles("admin"),deleteCategory);


export default router;