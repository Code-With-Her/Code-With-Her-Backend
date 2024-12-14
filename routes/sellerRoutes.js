import express from 'express';
import { registerSeller, addProduct, getProductsBySeller , getAllProducts,getSingleProduct,getAllSellers } from '../controllers/sellerController.js';

const router = express.Router();

// Register Seller
router.post('/registerseller', registerSeller);

// Add Product
router.post('/addproduct', addProduct);


// get all products
router.get('/products', getAllProducts);

router.get('/', getAllSellers); 

// Get Products by Seller
router.get('/products/:sellerID', getProductsBySeller);

router.get('/products/:id', getSingleProduct);



export default router;
