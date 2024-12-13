import UserModel from '../models/User.js';
import TempUserModel from '../models/TempUserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import ejs from 'ejs'; // Import EJS
import { v2 as cloudinary } from 'cloudinary';
import ImgModel from '../models/imageModel.js';

// Cloudinary config
cloudinary.config({
    cloud_name: "your_cloud_name",
    api_key: "your_api_key",
    api_secret: "your_api_secret",
});

// Register user
export const registerUser = async (req, res) => {
    const { fullname, email, password, phone, bio } = req.body;

    // Validate fields
    if (!fullname || !email || !password || !phone || !bio) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await UserModel.findOne({ email });
        const existingTempUser = await TempUserModel.findOne({ email });

        if (existingUser || existingTempUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const otp = crypto.randomInt(100000, 999999).toString();

        // Handle image upload if available
        let uploadedImage = null;
        if (req.file) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(req.file.path); // Upload to Cloudinary
                const newImage = new ImgModel({
                    url: uploadResponse.secure_url,
                    publicId: uploadResponse.public_id,
                    altText: "Profile image",
                });
                uploadedImage = await newImage.save(); // Save image to database
            } catch (error) {
                return res.status(500).json({ message: "Image upload failed", error: error.message });
            }
        }

        // Create temporary user record
        const tempUser = new TempUserModel({
            fullname,
            email,
            phone,
            bio,
            password: hashedPassword,
            verificationToken,
            otp,
            profileImage: uploadedImage?._id,
            otpExpires: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
        });

        await tempUser.save();

        // Send verification email
        const verificationLink = `http://localhost:8080/api/verify-email?token=${verificationToken}&otp=${otp}`;
        ejs.renderFile('./views/emailVerificationTemplate.ejs', { fullname, verificationLink, otp }, async (err, html) => {
            if (err) {
                return res.status(500).json({ message: "Error preparing verification email" });
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Verify Your Email",
                html: html,
            });

            // Send success response
            res.status(201).json({ message: "User registered successfully! Please verify your email." });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during registration", error: error.message });
    }
};

// Verify Email
export const verifyEmail = async (req, res) => {
    const { token, otp } = req.query;

    try {
        // Decode the JWT token to get the user's email
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if a user with the decoded email exists in the UserModel
        const tempUser = await TempUserModel.findOne({ email: decoded.email });

        if (!tempUser) {
            return res.status(404).json({ message: "Temporary user not found" });
        }

        // If the OTP is invalid or expired, return an error
        if (tempUser.otp !== otp || Date.now() > tempUser.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Create the actual user and transfer data
        const user = new UserModel({
            fullname: tempUser.fullname,
            email: tempUser.email,
            phone: tempUser.phone,
            bio: tempUser.bio,
            password: tempUser.password,
            isVerified: true,  // Set the user as verified
            profilePicture: tempUser.profileImage,
        });

        await user.save();
        await TempUserModel.deleteOne({ email: decoded.email });

        res.render('verify', { message: "Email verified successfully! You can now log in." });
    } catch (error) {
        res.status(500).json({ message: "Server error during verification", error: error.message });
    }
};

// Login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email }).populate('profileImage');
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email first" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ name: user.fullname, email: user.email, id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET, { expiresIn: '25m' });

        const userData = {
            name: user.fullname,
            email: user.email,
            profileImage: user.profileImage?.url,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
            id: user._id,
        };

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(Date.now() + 25 * 60 * 1000),
            sameSite: 'Strict',
        });

        res.json({
            status: 'ok',
            message: 'Login successful',
            token,
            user: userData,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Forgot password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const oldUser = await UserModel.findOne({ email });
        if (!oldUser) {
            return res.json({ status: "User not available" });
        }

        const secret = process.env.JWT_SECRET + oldUser.password;
        const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "10m" });
        const link = `http://localhost:8080/api/reset-password/${oldUser._id}/${token}`;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            text: `Click on the link to reset your password: ${link}`,
        });

        res.json({ status: "ok", message: "Password reset link sent to your email!" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        const oldUser = await UserModel.findOne({ _id: id });
        if (!oldUser) {
            return res.status(400).json({ status: "User not found" });
        }

        const secret = process.env.JWT_SECRET + oldUser.password;
        jwt.verify(token, secret, async (err) => {
            if (err) {
                return res.status(403).json({ status: "Invalid token or token expired" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            oldUser.password = hashedPassword;
            await oldUser.save();

            res.render('reset-success');
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    let query = {};
    const searchData = req.query.search;

    if (searchData) {
        query = {
            $or: [
                { fullname: { $regex: searchData, $options: "i" } },
                { email: { $regex: searchData, $options: "i" } },
            ],
        };
    }

    try {
        const allUsers = await UserModel.find(query);
        res.json({ status: "ok", data: allUsers });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await UserModel.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ status: "User not found" });
        }
        res.json({ status: "ok", message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server error" });
    }
};
