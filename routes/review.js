import express from 'express'
import { addReview, deleteReview, deleteReviewByAdmin, getMyReviews, getProductReviews, updateReview } from '../controllers/reviewController.js';
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/addReview',authorizeRoles("customer"),upload.array("images",3),addReview)
router.post('/updateReview/:id',authorizeRoles("customer"),upload.array("images",3),updateReview)
router.delete('/deleteReview/:id',authorizeRoles("customer"),deleteReview)
router.delete('/deleteReviewByAdmin/:id',authorizeRoles("admin"),deleteReviewByAdmin)

router.get('/getProductReviews/:productId',getProductReviews)
router.get('/getMyReviews',authorizeRoles("customer"),getMyReviews)


export default router;
