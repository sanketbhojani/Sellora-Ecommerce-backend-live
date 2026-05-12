import express from 'express'
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import { getWishlist,toggleWishlist,checkWishlist,clearWishlist } from '../controllers/Wishlistcontroller.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("customer"));

router.get('/getWishlist',getWishlist)
router.get('/checkWishlist/:productId',checkWishlist)
router.post('/toggleWishlist/:productId',toggleWishlist)
router.delete('/clearWishlist',clearWishlist)


export default router;