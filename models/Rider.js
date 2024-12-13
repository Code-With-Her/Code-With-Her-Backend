// Rider model with attributes UserID , sellerID, and description

import mongoose from 'mongoose';

const riderModel = mongoose.model({
    userID:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    sellerID:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Seller',
        required:true
    },

    description:{
        type:String,
        required:true
    },

    status:{
        type: String,
        enum: ["Available", "Booked", "Canceled"],
        default: "Available",
    },

    location:{
        type:String,
        required:true
    },

    citizenship:{
     type:String,
     required:true
    },
},
    {Timestamp:true});