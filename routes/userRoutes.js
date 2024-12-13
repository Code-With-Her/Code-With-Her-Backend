import express from "express";
import { registerUser, loginUser, forgotPassword, getAllUsers } from "../controllers/userController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route for user registration
router.post("/register", registerUser);

// Route for user login
router.post("/login", loginUser);

// Route for forgot password functionality
router.post("/forgot-password", forgotPassword);

// Route to get all users (Admin only)
router.get("/", protect, isAdmin, getAllUsers);

export default router;
