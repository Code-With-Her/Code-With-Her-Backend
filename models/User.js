import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
      fullname: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      phone: {
        type: String,
        required: true,
      },
      bio: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      isAdmin: {
        type: Boolean,
        default: false, // Regular user by default
      },
      isVerified: {
        type: Boolean,
        default: false, // Email verification status
      },
      profileImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
      },
      verificationToken: String,
      otp: String,
      otpExpires: Date,
    },
    {
      timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
  );
  
  const UserModel = mongoose.model('User', userSchema);
  
  export default UserModel;
  