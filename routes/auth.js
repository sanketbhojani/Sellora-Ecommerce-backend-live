import express from 'express'
import { changePassword, forgotPassword, getMe, login, logout, registerAdmin, registerCustomer, registerSeller, resendOTP, resetPassword, verifyOTP } from '../controllers/authController.js';
import {  authorizeRoles, protect } from '../middlewares/authMiddleware.js';

const router  = express.Router();

router.post('/register/registerCustomer',registerCustomer)
router.post('/register/registerSeller',registerSeller)
router.post('/register/registerAdmin',protect,authorizeRoles("admin"),registerAdmin)
router.post('/verifyOTP',verifyOTP)
router.post('/resendOTP',resendOTP)
router.post('/login',login)
router.post('/changePassword',protect,changePassword)
router.post('/forgotPassword',forgotPassword)
router.post('/resetPassword',resetPassword)
router.get('/getMe',protect,getMe)
router.post('/logout',logout)
export default router;