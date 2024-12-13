import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    altText: { type: String, default: "Image" },
});

const ImgModel = mongoose.model('Image', imageSchema);

export default ImgModel;