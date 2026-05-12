import express from 'express'
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import { addProduct, deleteProduct, getAllProducts, getMyProducts, getProductById, updateProduct } from '../controllers/productController.js';
import upload from '../middlewares/uploadMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import { createProductSchema, updateProductSchema } from '../validators/productValidator.js';

const router =express.Router();

router.get('/getAllProducts',getAllProducts)
router.get('/getProductById/:id',getProductById)

router.use(protect);

router.get('/getMyProducts',authorizeRoles("seller","admin"),getMyProducts)

router.post('/addProduct',authorizeRoles("seller"),upload.array("images",5),validate(createProductSchema),addProduct);

router.post('/updateProduct/:id',authorizeRoles("seller","admin"),upload.array("images",5),validate(updateProductSchema),updateProduct);


router.delete('/deleteProduct/:id',authorizeRoles("seller","admin"),deleteProduct)

export default router;