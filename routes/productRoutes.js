import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { verifyUser } from '../middlewares/auth.js'; // Make sure to create this middleware for token verification

const router = express.Router();

// Route for creating a new product (requires login)
router.post('/add', verifyUser, createProduct);

// Route for getting all products
router.get('/', getAllProducts);

// Route for getting a single product by ID
router.get('/:productId', getProductById);

// Route for updating a product (requires login)
router.put('/:productId', verifyUser, updateProduct);

// Route for deleting a product (requires login)
router.delete('/:productId', verifyUser, deleteProduct);

export default router;
