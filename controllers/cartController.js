import Cart from "../models/Cart.js";
import Product from "../models/Products.js";

export const addToCart = async (req, res) => {
  // Check if userId is provided in the request body, if not, use the userId from the token
  const userId = req.body.userId || req.user.id; // userId from body or from the token
  const { productId, quantity } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the cart for the user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity }],
        totalPrice: product.price * quantity,
      });
    } else {
      // Check if product already exists in the cart
      const existingProductIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingProductIndex >= 0) {
        // Update quantity and total price
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        // Add the new product to the cart
        cart.products.push({ product: productId, quantity });
      }

      // Recalculate total price
      cart.totalPrice = cart.products.reduce(
        (total, item) => total + item.quantity * product.price,
        0
      );
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get user's cart
export const getCart = async (req, res) => {
  const userId = req.user.id;  // Get userId from the verified token or cookies

  try {
    // Fetch cart data for the user
    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product", // Populate the product details
      "name price"         // Only select the name and price fields
    );

    // If cart is not found, return a 404 error
    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found"
      });
    }

    // Calculate total price from the cart products
    const totalPrice = cart.products.reduce(
      (total, product) => total + product.product.price * product.quantity,
      0
    );

    // Return the cart details along with total price
    res.status(200).json({
      status: "success",
      cart,
      totalPrice, // Send the total price as well
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};


// Update product quantity in cart
export const updateCart = async (req, res) => {
  const userId = req.user.id;  // Get userId from the verified token or cookies
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex >= 0) {
      cart.products[productIndex].quantity = quantity;

      // Recalculate total price
      cart.totalPrice = cart.products.reduce(
        (total, item) =>
          total + item.quantity * (item.product.price || 0), // Ensure product price exists
        0
      );

      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove product from cart
export const removeFromCart = async (req, res) => {
  const userId = req.user.id;  // Get userId from the verified token or cookies
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );

    // Recalculate total price
    cart.totalPrice = cart.products.reduce(
      (total, item) =>
        total + item.quantity * (item.product.price || 0), // Ensure product price exists
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  const userId = req.user.id;  // Get userId from the verified token or cookies

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = [];
    cart.totalPrice = 0;

    await cart.save();
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
