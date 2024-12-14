import Review from '../models/Review.js';
import { Seller } from '../models/Seller.js';
import jwt from 'jsonwebtoken'; // Import jwt to decode the token

// Helper function to verify the token and get the user ID
const getUserIdFromToken = (token) => {
  try {
    // Decode the JWT token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT_SECRET
    console.log('Decoded Token:', decoded); // Debugging log to check the token structure
    return decoded.id; // Use 'id' as per the token structure
  } catch (error) {
    console.error('Error decoding token:', error);
    throw new Error('Invalid or expired token');
  }
};

// Controller to create a new review
export const createReview = async (req, res) => {
  try {
    const { sellerId, reviewText, rating } = req.body;

    // Check if required fields are provided
    if (!sellerId || !reviewText || !rating) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Get token from cookies
    const token = req.cookies.token; // Assuming the token is stored as 'token' in cookies
    console.log('Token from cookies:', token); // Debugging log

    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }

    // Get userId from the token
    const userId = getUserIdFromToken(token); // Get userId from token
    console.log('Decoded userId:', userId); // Debugging log

    if (!userId) {
      return res.status(403).json({ message: 'Invalid token, unable to get userId' });
    }

    // Verify if the seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Create a new review
    const newReview = new Review({
      user: userId, // 'user' field should match your schema definition
      seller: sellerId, // 'seller' field should match your schema definition
      reviewText,
      rating,
    });

    await newReview.save();

    res.status(201).json({ message: 'Review submitted successfully', review: newReview });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

