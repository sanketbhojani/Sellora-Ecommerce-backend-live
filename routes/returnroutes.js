import express from 'express'
import { approveReturn, getAllReturns, getMyReturns, getReturnById, getReturnStats, rejectReturn, requestReturn } from '../controllers/returnController.js';
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/requestReturn',authorizeRoles("customer"),upload.array("images",3),requestReturn)
router.get('/getMyReturns',authorizeRoles("customer"),getMyReturns)
router.get('/getAllReturns',authorizeRoles("admin"),getAllReturns)
router.post('/approveReturn/:id',authorizeRoles("admin"),approveReturn) //return id
router.post('/rejectReturn/:id',authorizeRoles("admin"),rejectReturn)  //return id
router.get('/getReturnStats',authorizeRoles("admin"),getReturnStats)  

router.get('/getReturnById/:id',authorizeRoles("admin","customer"),getReturnById) // return id

export default router;