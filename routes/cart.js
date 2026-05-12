import express from 'express'
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import { addToCart, clearCart, getCart, removeFromCart, updateCartItem } from '../controllers/cartController.js';

const router  = express.Router();

router.use(protect);
router.use(authorizeRoles("customer"));


router.get('/getCart',getCart)
router.post('/addToCart',addToCart)
router.post('/updateCartItem/:productId',updateCartItem)
router.delete('/removeFromCart/:productId',removeFromCart)
router.delete('/clearCart',clearCart)
export default router;