import mongoose from "mongoose";

const imagesSchema = new mongoose.Schema(
  {
    imgUrl: {
      type: String,
      required: true,
    },
    publicID: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Images = mongoose.model("Images", imagesSchema); // Define the model first
export default Images; // Then export it
