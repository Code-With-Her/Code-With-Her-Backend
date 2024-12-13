// Seller model with entitties userID , farmName , citizenshipIMG, location

import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    farmName:{
        type:String,
        required:true
    },

    citizenshipIMG:{
        type:String,
        required:true
    },

    location:{
        type:String,
        required:true
    }
}, {Timestamp:true}

);

// export now with the es6 modules

export const Seller = mongoose.model('Seller',sellerSchema);