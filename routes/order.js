import express from 'express'
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import { placeOrder,getMyOrders, getOrderById, updateOrderStatus, getSellerOrders, getOrderStats } from '../controllers/orderController.js';

const router = express.Router();

router.use(protect);

router.post('/placeOrder',authorizeRoles("customer"),placeOrder)
router.get('/getMyOrders',authorizeRoles("customer"),getMyOrders)
router.get('/getOrderById/:id',authorizeRoles("customer","admin"),getOrderById)
// router.post('/cancelOrder/:id',authorizeRoles("customer"),cancelOrder)


// router.get('/getAllOrders',authorizeRoles("admin"),getAllOrders)
router.get('/getSellerOrders',authorizeRoles("seller"),getSellerOrders)
router.get('/getOrderStats',authorizeRoles("admin"),getOrderStats)

router.post('/updateOrderStatus/:id',authorizeRoles("admin"),updateOrderStatus)



export default router;