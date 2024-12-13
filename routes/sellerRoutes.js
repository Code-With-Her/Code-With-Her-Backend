import express from 'express';
import { registerSeller, addProduct, getProductsBySeller } from '../controllers/sellerController.js';

const router = express.Router();

// Register Seller
router.post('/registerseller', registerSeller);

// Add Product
router.post('/addproduct', addProduct);

// Get Products by Seller
router.get('/products/:sellerID', getProductsBySeller);

export default router;
