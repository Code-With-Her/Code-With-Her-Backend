import express from 'express';
import {
    registerSeller,
    addProduct,
    getProductsBySeller,
    getAllProducts,
    getSingleProduct,
    getAllSellers,
    getSellerById,
} from '../controllers/sellerController.js';

const router = express.Router();

// Register Seller
router.post('/registerseller', registerSeller);

// Add Product
router.post('/addproduct', addProduct);

// Get all products
router.get('/products', getAllProducts);

// Get all sellers
router.get('/', getAllSellers);

// Get products by seller ID
router.get('/products/seller/:sellerID', getProductsBySeller);

// Get single seller by ID
router.get('/sellers/:id', getSellerById);

// Get single product by ID
router.get('/products/:id', getSingleProduct);

export default router;
