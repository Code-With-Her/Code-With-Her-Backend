
import express from 'express';
import {
    registerUser,
    getSingleUser,
    loginUser,
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser,
    updateUser,
    getPaginatedUsers,
    uploadImage, 
    getImage, 
    updateImage, 
    deleteImage,
    resetPasswordPage,
    verifyEmail
} from '../controllers/userController.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// User Registration
router.post('/register', (req, res, next) => {
    upload.single("img")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error during file upload', error: err.message });
        }
        next(); // Proceed if no error
    });
}, registerUser);


// Render OTP input page
router.get('/verify-email', verifyEmail); 

router.get('/user/:id', getSingleUser);

// User Login
router.post('/login', loginUser);

router.post('/forgot-password', forgotPassword);

// Reset Password (POST to update the password)
router.post('/reset-password/:id/:token', resetPassword);

// Render Forgot Password Page (GET)
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});


// Render Reset Password Page (GET)
router.get('/reset-password/:id/:token', resetPasswordPage);


// Get All Users
router.get('/users', getAllUsers);

// Get Paginated Users
router.get('/users/paginated', getPaginatedUsers);

// Delete User
router.delete('/users/delete', deleteUser);

// Update User
router.put('/users/update/:id', updateUser); // New route for updating user

// Upload Image
router.post('/images', uploadImage);

// Get Images
router.get('/images/:id', getImage);

// Update image by ID
router.put('/images/:id', updateImage); // New route for updating image

// Delete image by ID
router.delete('/images/:id', deleteImage); // New route for deleting image



// Export the router
export default router;
