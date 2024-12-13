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
    location: {
      type: {
        type: String, // The type of the location. Always 'Point' for GeoJSON
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    roles: {
      type: [String],
      enum: ['User', 'Seller', 'Buyer', 'Rider'],
      default: ['User'],
    },
  },
  {
    timestamps: true,
  }
);

// Add 2dsphere index for the location field to support spatial queries
userSchema.index({ location: '2dsphere' });

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
