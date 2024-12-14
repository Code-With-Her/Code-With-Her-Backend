import { Seller } from '../models/Seller.js';
import Product  from '../models/Products.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const registerSeller = async (req, res) => {
    try {
        // Extract token from Authorization header
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized: No token provided",
            });
        }

        // Decode the token to get user details
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Extract the userID from the decoded token
        const userID = decoded.id; // Assuming `id` is the field in the token that contains the user ID

        // Extract other fields from the request body
        const { farmName, citizenshipIMG, location } = req.body;

        // Ensure all required fields are present
        if (!farmName || !citizenshipIMG || !location) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields: farmName, citizenshipIMG, location",
            });
        }

        // Create a new Seller document using the decoded userID
        const newSeller = new Seller({
            userID,
            farmName,
            citizenshipIMG,
            location,
        });

        // Save the new seller to the database
        await newSeller.save();

        // Respond with the created seller data
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

export const getAllSellers = async (req, res) => {
    try {
        // Fetch all sellers from the database
        const sellers = await Seller.find();

        // Count the total number of sellers
        const totalSellers = await Seller.countDocuments();

        // Respond with the list of sellers and the total count
        res.status(200).json({
            status: 'success',
            message: 'All sellers retrieved successfully',
            totalSellers,
            sellers,
        });
    } catch (error) {
        console.error('Error retrieving sellers:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};


// Add product controller
export const addProduct = async (req, res) => {
    try {
        // Extract token from cookies
        let token = req.cookies.token;

        // If token is not in cookies, check Authorization header
        if (!token) {
            const authHeader = req.headers['authorization'];
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];  // Extract token after "Bearer "
            }
        }

        // If no token is provided in either cookies or header, return Unauthorized
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

// Get products by seller controller
export const getProductsBySeller = async (req, res) => {
    const { sellerID } = req.params;

    try {
        // Ensure we use the correct field `seller` as in your schema
        const products = await Product.find({ seller: sellerID }).populate('seller', 'farmName location');

        if (products.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No products found for this seller',
            });
        }

        res.status(200).json({
            status: 'success',
            products,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

// Get all products with pagination
export const getAllProducts = async (req, res) => {
    try {
        // Extract token from cookies
        let token = req.cookies.token;

        // If token is not in cookies, check Authorization header
        if (!token) {
            const authHeader = req.headers['authorization'];
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];  // Extract token after "Bearer "
            }
        }

        // If no token is provided in either cookies or header, return Unauthorized
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

        const userID = decoded.id;

        // Fetch all products, sorted by the latest created (by 'createdAt' in descending order)
        const products = await Product.find()
            .populate('seller', 'farmName location')
            .sort({ createdAt: -1 });  // Sorting by 'createdAt' in descending order (latest first)

        // Check if products exist
        if (products.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No products found',
            });
        }

        res.status(200).json({
            status: 'success',
            products,
        });
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};


// Get a single product by ID
export const getSingleProduct = async (req, res) => {
    try {
        // Extract token from cookies
        let token = req.cookies.token;

        // If token is not in cookies, check Authorization header
        if (!token) {
            const authHeader = req.headers['authorization'];
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];  // Extract token after "Bearer "
            }
        }

        // If no token is provided in either cookies or header, return Unauthorized
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

        const userID = decoded.id;

        // Fetch the product by ID
        const productId = req.params.id;  // Get the product ID from the URL parameter
        const product = await Product.findById(productId)
            .populate('seller', 'farmName location');  // Populate seller details if necessary

        // If the product is not found
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found',
            });
        }

        // Respond with the product details
        res.status(200).json({
            status: 'success',
            product,
        });
    } catch (error) {
        console.error('Error fetching single product:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
};