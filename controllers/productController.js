import Products from "../models/Products.js";
import mongoose from "mongoose";

// Create a new product
export const createProduct = async (req, res) => {
    const { productName, description, price, stock, images } = req.body;
    const seller = req.user.id; // Get seller (user) ID from authenticated user
  
    try {
      // Create a new product
      const product = new Products({
        seller,
        productName,
        description,
        price,
        stock,
        images,
      });
  
      // Save the product to the database
      await product.save();
      res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Products.find().populate("seller", "name email"); // Populate seller information

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
    const { productId } = req.params;  // Extract productId from route params
  
    try {
      // Find the product by its ID and populate the seller field with name and email
      const product = await Products.findById(productId).populate("seller", "name email");
  
      // If the product is not found, return a 404 response
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Return the product details with the populated seller info
      res.status(200).json(product);
    } catch (error) {
      // Handle errors and return a 500 response with the error message
      res.status(500).json({ message: error.message });
    }
  };
  

// Update a product
export const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { productName, description, price, stock, images } = req.body;

  try {
    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure the user is the seller of this product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own products" });
    }

    // Update the product fields
    product.productName = productName || product.productName;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.images = images || product.images;

    // Save the updated product
    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    const { productId } = req.params;
  
    try {
      const product = await Products.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Ensure the user is the seller of this product
      if (product.seller.toString() !== req.user.id) {
        return res.status(403).json({ message: "You can only delete your own products" });
      }
  
      // Delete the product
      await Products.deleteOne({ _id: productId }); // Use deleteOne instead of remove
  
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  