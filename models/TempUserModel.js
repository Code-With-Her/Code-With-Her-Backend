import mongoose from 'mongoose';

// Define location schema to store GeoJSON data
const locationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'], // GeoJSON point type
        required: true,
    },
    coordinates: {
        type: [Number], // Array of [longitude, latitude]
        required: true,
    },
}, { _id: false }); // Avoid creating an extra _id field for this subdocument

// Define the TempUser schema
const TempUserSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    bio: { type: String, required: true },
    password: { type: String, required: true },
    verificationToken: { type: String, required: true },
    profileImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true },
    location: {
        type: locationSchema, // Embedding the location schema
        required: true,
    },
});

const TempUserModel = mongoose.model('TempUser', TempUserSchema);

export default TempUserModel; // Ensure this is a default export
