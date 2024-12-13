
import cloudinaryModule from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const cloudinary = cloudinaryModule.v2;

try {
    // Configure Cloudinary with environment variables
    cloudinary.config({
        cloud_name: 'dayvwvkpm',
        api_key: '615635117163975',
        api_secret: '8X7vfCYOV-jG5d0JgNICV0iAUvg',
    });

    //CLOUDINARY_API_KEY=615635117163975
//CLOUDINARY_API_SECRET=8X7vfCYOV-jG5d0JgNICV0iAUvg
//CLOUDINARY_CLOUD_NAME=dayvwvkpm

    console.log("Cloudinary configuration successful.");
} catch (error) {
    console.error("Error configuring Cloudinary:", error.message);
    throw new Error("Failed to configure Cloudinary. Please check your credentials.");
}

let storage;
try {
    // Set up Cloudinary storage with multer
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'uploads', // Folder in Cloudinary to store images
            allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'], // Added more formats for flexibility
        },
    });

    console.log("Cloudinary storage setup successful.");
} catch (error) {
    console.error("Error setting up Cloudinary storage:", error.message);
    throw new Error("Failed to set up Cloudinary storage.");
}

let upload;
try {
    // Configure multer to handle multiple files
    upload = multer({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10 MB
    });

    console.log("Multer setup successful.");
} catch (error) {
    console.error("Error setting up multer:", error.message);
    throw new Error("Failed to set up multer.");
}

// Export the cloudinary instance and the multer upload middleware
export { cloudinary, upload };
