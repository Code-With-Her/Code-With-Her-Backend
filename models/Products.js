// models/Products.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  // Assuming your user model is named 'User'
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    images: {
      type: String,
      required: false, // Make this optional if necessary
    },
  },
  { timestamps: true }
);

const Products = mongoose.model("Products", productSchema);

export default Products;
