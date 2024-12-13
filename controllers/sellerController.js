import { Seller } from '../models/Seller.js';
import Product  from '../models/Products.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const registerSeller = async (req, res) => {
    const { userID, farmName, citizenshipIMG, location } = req.body;

    try {
        const newSeller = new Seller({ userID, farmName, citizenshipIMG, location });
        await newSeller.save();

        res.status(201).json({
            status: 'success',
            message: 'Seller registered successfully',
            seller: newSeller,
        });
    } catch (error) {
        console.error('Error registering seller:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

export const addProduct = async (req, res) => {
    try {
        // Extract token from cookies
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: No token provided",
            });
        }

        // Decode the token to get user details
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Log the decoded user details to ensure the userID is being decoded correctly
        console.log("Decoded user ID:", decoded.id); // Debugging log

        const userID = decoded.id;  // The correct field for userID is 'id' based on your previous login function

        // Extract product details from request body
        const { productName, description, price, stock, productImage } = req.body;

        // Ensure all required fields are present
        if (!productName || !productImage || !price || !stock) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields: productName, productImage, price, stock",
            });
        }

        // Create a new product with user details
        const newProduct = new Product({
            seller: userID,  // This should be a valid userID
            productName,
            description,
            price,
            stock,
            images: productImage, // Adjust based on your schema
        });

        // Save the new product to the database
        await newProduct.save();

        res.status(201).json({
            status: "success",
            message: "Product added successfully",
            product: newProduct,
        });
    } catch (error) {
        console.error("Error adding product:", error);

        // Handle token errors separately
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({
                status: "error",
                message: "Invalid or expired token",
            });
        }

        // General error handling for product creation
        if (error.name === "ValidationError") {
            return res.status(400).json({
                status: "error",
                message: `Validation error: ${error.message}`,
            });
        }

        res.status(500).json({ status: "error", message: "Server error" });
    }
};



export const getProductsBySeller = async (req, res) => {
    const { sellerID } = req.params;

    try {
        const products = await Product.find({ sellerID }).populate('sellerID', 'farmName location');

        res.status(200).json({
            status: 'success',
            products,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};