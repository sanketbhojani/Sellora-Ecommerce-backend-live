import express from "express";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import { cancelMyOrder, getMyDashboard, getMyOrderById, getMyOrders, trackMyOrder } from "../controllers/customerCtroller.js";

const router = express.Router();


router.use(protect,authorizeRoles("customer"));

router.get("/getMyOrders",getMyOrders)
router.get("/getMyOrderById/:orderId",getMyOrderById)
router.post("/cancelMyOrder/:orderId",cancelMyOrder)
router.get("/trackMyOrder/:orderId",trackMyOrder)



router.get("/getMyDashboard",getMyDashboard)


export default router;