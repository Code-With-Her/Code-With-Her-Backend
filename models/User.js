import mongoose from "mongoose";

const userSchema =
  ({
    fullName: {
      type: String,
      required: true,
    },


    phoneNumber:{
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
      enum: ["Seller", "Buyer","Rider","User"],
      default: "user",
    },

    profileImg:{
        type: String,
        default:null,
    },

    registeredAt:{
        type: Date,
        default: Date.now,
    },

    lastLogin:{
        type: Date,
        default: Date.now,
    }
  },
  { timestances: true });

const User = mongoose.model("User", userSchema);
