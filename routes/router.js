import express from 'express'
import auth from './auth.js'
import admin from './admin.js'
import product from './product.js'
import category from '../routes/category.js'
import subcategory from '../routes/subcategory.js'
import profile from '../routes/profile.js'
import address from '../routes/address.js'
import wishlist from '../routes/wishlistroutes.js'
import cart from '../routes/cart.js'
import order from '../routes/order.js'
import payment  from '../routes/payment.js'
import returnroute from '../routes/returnroutes.js'
import seller from '../routes/seller.js'
import review from '../routes/review.js'
import coupon from '../routes/coupon.js'
import customer from '../routes/customer.js'
import twilioRoutes from '../routes/twilioRoutes.js'

const router  = express.Router();

router.use('/auth',auth);
router.use('/admin',admin);
router.use('/product',product)
router.use('/category',category)
router.use('/subcategory',subcategory)
router.use('/profile',profile)
router.use('/address',address)
router.use('/wishlist',wishlist)
router.use('/cart',cart)
router.use('/order',order)
router.use('/payment',payment)
router.use('/return',returnroute)
router.use('/seller',seller)
router.use('/review',review)
router.use('/coupon',coupon)
router.use('/customer',customer)
router.use('/twilio', twilioRoutes)

export default router;