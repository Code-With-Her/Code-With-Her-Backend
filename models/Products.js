import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Assuming your user model is named 'User'
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    images: {
        type: String,
        required: false // Make this optional if necessary
    },
});



// export using the module es6

const Products = mongoose.model("Products", productSchema);


export default Products;