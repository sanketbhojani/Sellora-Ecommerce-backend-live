import express from "express";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";
import { addAddress, deleteAddress, getAddressById, getAddresses, setDefaultAddress, updateAddress } from "../controllers/addresscontroller.js";

const router = express.Router();

router.use(protect,authorizeRoles("customer"));

router.post('/addAddress',addAddress)
router.get('/getAddresses',getAddresses)
router.get('/getAddressById/:id',getAddressById)
router.post('/setDefaultAddress/:id',setDefaultAddress)
router.post('/updateAddress/:id',updateAddress)
router.delete('/deleteAddress/:id',deleteAddress)
export default router;