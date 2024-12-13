import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

// Add a product to the cart
router.post("/add", addToCart);

// Get user's cart
router.get("/:userId", getCart);

// Update product quantity in cart
router.put("/update", updateCart);

// Remove product from cart
router.delete("/remove", removeFromCart);

// Clear the cart
router.delete("/clear/:userId", clearCart);

export default router;
