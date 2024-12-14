import express from 'express';
import { createReview , getReviewsBySellerId} from '../controllers/reviewController.js';
import { verifyUser } from '../middlewares/auth.js';  // Import the verifyUser middleware

const router = express.Router();

// Route to create a review (protected by verifyUser middleware)
router.post('/', verifyUser, createReview);
router.get('/:sellerId', getReviewsBySellerId);


export default router;
