import express from 'express'
import { applyCoupon, createCoupon, deleteCoupon, getAllCoupons, toggleCouponStatus, updateCoupon } from '../controllers/couponController.js';
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/applyCoupon',authorizeRoles("customer"),applyCoupon);


router.post('/createCoupon',authorizeRoles("admin"),createCoupon);
router.get('/getAllCoupons',authorizeRoles("admin"),getAllCoupons);
router.post('/updateCoupon/:id',authorizeRoles("admin"),updateCoupon);
router.delete('/deleteCoupon/:id',authorizeRoles("admin"),deleteCoupon);
router.post('/toggleCouponStatus/:id',authorizeRoles("admin"),toggleCouponStatus);


export default router;