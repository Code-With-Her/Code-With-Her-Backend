import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { verifyUser } from "../middlewares/auth.js";  // Assuming you have a middleware to verify users

const router = express.Router();

// Add a product to the cart
router.post("/add", verifyUser, addToCart);

// Get user's cart
router.get("/", verifyUser, getCart);  // No need for userId in the params, we get it from cookies

// Update product quantity in cart
router.put("/update", verifyUser, updateCart);  // No need for userId in the body, we get it from cookies

// Remove product from cart
router.delete("/remove", verifyUser, removeFromCart);  // No need for userId in the body, we get it from cookies

// Clear the cart
router.delete("/clear", verifyUser, clearCart);  // No need for userId in the params, we get it from cookies

export default router;
