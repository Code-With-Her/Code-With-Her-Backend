import express from 'express';
import { registerSeller, addProduct, getProductsBySeller , getAllProducts } from '../controllers/sellerController.js';

const router = express.Router();

// Register Seller
router.post('/registerseller', registerSeller);

// Add Product
router.post('/addproduct', addProduct);

// Get Products by Seller
router.get('/products/:sellerID', getProductsBySeller);

// get all products
router.get('/products', getAllProducts);


export default router;
