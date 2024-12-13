import UserModel from '../models/User.js'; 
import TempUserModel from '../models/TempUserModel.js'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto'; 
import ejs from 'ejs'; // Import EJS
import { v2 as cloudinary} from 'cloudinary';
import ImgModel from '../models/ImgModel.js';
import User from '../models/User.js';

cloudinary.config({
    cloud_name: "dayvwvkpm",
    api_key: "615635117163975",
    api_secret: "8X7vfCYOV-jG5d0JgNICV0iAUvg",
  });

  
  export const registerUser = async (req, res) => {
    const { fullname, email, password, phone, bio, latitude, longitude, roles } = req.body;

    // Check for required fields
    if (!fullname || !email || !password || !phone || !bio || !latitude || !longitude || !roles) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if user or temp user already exists
        const existingUser = await UserModel.findOne({ email });
        const existingTempUser = await TempUserModel.findOne({ email });

        if (existingUser || existingTempUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const otp = crypto.randomInt(100000, 999999).toString(); // Generate a random OTP

        // Handle optional image upload
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

        // Create a temporary user record
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
            location: {
                type: "Point", // GeoJSON type
                coordinates: [longitude, latitude], // GeoJSON coordinates [longitude, latitude]
            },
            roles, // Roles like ['Seller', 'Buyer', 'Rider', 'User']
        });

        await tempUser.save();

        // Send verification email
        const verificationLink = `https://code-with-her-backend.onrender.com/api/verify-email?token=${verificationToken}&otp=${otp}`;
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


export const verifyEmail = async (req, res) => {
    const { token, otp } = req.query;

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the temporary user
        const tempUser = await TempUserModel.findOne({ email: decoded.email }).populate('profileImage');
        if (!tempUser) {
            return res.status(404).json({ message: "Invalid token or user not found" });
        }

        // Check if the OTP is valid
        if (tempUser.otp !== otp || Date.now() > tempUser.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Ensure required fields are present
        if (!tempUser.phone || !tempUser.bio) {
            return res.status(400).json({ message: "Phone or bio is missing" });
        }

        // Create a new user
        const newUser = new UserModel({
            fullname: tempUser.fullname,
            email: tempUser.email,
            phone: tempUser.phone,
            bio: tempUser.bio,
            password: tempUser.password,
            profileImage: tempUser.profileImage,
            isVerified: true,
            location: tempUser.location, // Copy location from TempUser
            roles: tempUser.roles, // Copy roles from TempUser
        });

        await newUser.save();

        // Delete the temporary user
        await TempUserModel.deleteOne({ email: decoded.email });

        res.render('verify', { message: "Email verified successfully! You can now log in." });
    } catch (error) {
        res.status(500).json({ message: "Server error during verification", error: error.message });
    }
};





export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Find the user by email and populate the profileImage field
        const user = await UserModel.findOne({ email }).populate('profileImage');
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if the user is verified
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email first" });
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create a JWT token with a 25-minute expiration
        const token = jwt.sign(
            { name: user.fullname, email: user.email, id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '25m' }
        );

        // Check if profileImage is populated and handle missing values
        const profileImageUrl = user.profileImage?.url || null; // Fallback to null if no profile image

        // Extract location data if available
        const userLocation = user.location || null; // This will return the location object or null if not available

        // Prepare user data
        const userData = {
            name: user.fullname,
            email: user.email,
            profileImage: profileImageUrl,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
            id: user._id,
            location: userLocation, // Include location data in the response
        };

        // Set the token in an HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Ensure cookie is sent over HTTPS in production
            expires: new Date(Date.now() + 25 * 60 * 1000), // Cookie expiration (25 minutes)
            sameSite: 'Strict', // Mitigates CSRF attacks
        });

        // Optionally set the user data in cookies (make sure not to put sensitive information like password)
        res.cookie('user', JSON.stringify(userData), {
            httpOnly: false, // You can change this to true if you don't need to access it in JavaScript
            secure: process.env.NODE_ENV === 'production', // Ensure cookie is sent over HTTPS in production
            expires: new Date(Date.now() + 25 * 60 * 1000), // Cookie expiration (same as token)
            sameSite: 'Strict', // Mitigates CSRF attacks
        });

        // Respond with user details and the token
        return res.status(200).json({
            status: 'ok',
            message: 'Login successful',
            token,
            user: userData, // Include location data here
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};





// Get Single User by ID
export const getSingleUser = async (req, res) => {
    const { id } = req.params; // Get user ID from request parameters

    try {
        const user = await UserModel.findById(id); // Find user by ID
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }
        res.json({ status: "ok", data: user }); // Return the user data
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const oldUser = await UserModel.findOne({ email });
        if (!oldUser) {
            return res.json({ status: "User not available" });
        }

        const secret = process.env.JWT_SECRET + oldUser.password;
        const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "10m" });

        const link = `https://code-with-her-backend.onrender.com/api/reset-password/${oldUser._id}/${token}`;

        // Set up nodemailer transporter
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS // Your email password or app password
            }
        });

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            text: `Click on the link to reset your password: ${link}`,
        });

        res.json({ status: "ok", message: "Password reset link sent to your email!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// Reset Password (POST to update the password)
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

            // Update the user's password
            const hashedPassword = await bcrypt.hash(password, 10);
            oldUser.password = hashedPassword;
            await oldUser.save();

            // Render the success page
            res.render('reset-success');
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};


// Get All Users
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
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    const { userid } = req.body;
    try {
        const result = await UserModel.deleteOne({ _id: userid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }
        res.json({ status: "ok", message: "User deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// Update User
export const updateUser = async (req, res) => {
    const { id } = req.params; // Get user ID from request parameters
    const { fullname, email, password, isAdmin } = req.body; // Destructure the request body

    // Validate the required fields
    if (!fullname || !email) {
        return res.status(400).json({ message: "Full name and email are required" });
    }

    try {
        const updatedUserData = {
            fullname,
            email,
            isAdmin, // Optional field to update admin status
        };

        // If a password is provided, hash it
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedUserData.password = hashedPassword;
        }

        // Find and update the user
        const updatedUser = await UserModel.findByIdAndUpdate(id, updatedUserData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ status: "ok", message: "User updated successfully", data: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// Get Paginated Users
export const getPaginatedUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to 1
    const limit = parseInt(req.query.limit) || 10; // Default limit
    const startIndex = (page - 1) * limit;

    try {
        const allUsers = await UserModel.find({});
        const results = {
            totalUser: allUsers.length,
            pageCount: Math.ceil(allUsers.length / limit),
            result: allUsers.slice(startIndex, startIndex + limit),
        };

        if (startIndex + limit < allUsers.length) {
            results.next = { page: page + 1 };
        }
        if (startIndex > 0) {
            results.prev = { page: page - 1 };
        }

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// Upload Image
// Upload image
export const uploadImage = async (req, res) => {
    const { base64 } = req.body;
    try {
        const newImage = await Images.create({ image: base64 });
        res.json({ status: "ok", data: newImage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// Get Image by ID
export const getImage = async (req, res) => {
    const { id } = req.params;
    try {
        const image = await Images.findById(id);
        if (!image) {
            return res.status(404).json({ status: "error", message: "Image not found" });
        }
        res.json({ status: "ok", data: image });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// Update Image by ID
export const updateImage = async (req, res) => {
    const { id } = req.params;
    const { base64 } = req.body; // Assuming you're sending the updated Base64 image in the body
    try {
        const updatedImage = await Images.findByIdAndUpdate(id, { image: base64 }, { new: true });
        if (!updatedImage) {
            return res.status(404).json({ status: "error", message: "Image not found" });
        }
        res.json({ status: "ok", data: updatedImage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

// Delete Image by ID
export const deleteImage = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedImage = await Images.findByIdAndDelete(id);
        if (!deletedImage) {
            return res.status(404).json({ status: "error", message: "Image not found" });
        }
        res.json({ status: "ok", message: "Image deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};


// Render Reset Password Page
// Render Reset Password Page
export const resetPasswordPage = async (req, res) => {
    const { id, token } = req.params;

    try {
        const oldUser = await UserModel.findOne({ _id: id });
        if (!oldUser) {
            return res.status(400).json({ status: "User not found" });
        }

        const secret = process.env.JWT_SECRET + oldUser.password;
        jwt.verify(token, secret, (err) => {
            if (err) {
                return res.status(403).json({ status: "Invalid token or token expired" });
            }

            // Render reset.ejs with id and token as parameters
            res.render('reset', { id, token });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};