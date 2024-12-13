import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Seller", "Buyer", "Rider", "User"],
      default: "user",
    },

    profileImg: {
      type: String,
      default: null,
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },

    otp: {
      type: String,
      required: true,
    },

    otpExpires: {
      type: Date,
      required: true,
    },

    verificationToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Enables createdAt and updatedAt fields
);

const TempUser = mongoose.model("TempUser", tempUserSchema);

export default TempUser;
