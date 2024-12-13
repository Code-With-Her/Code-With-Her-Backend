// Buyer schema with attributes userID,SellerID,location

import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema({
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

   location:{
    type:String,
    required:true
   }

},{Timestamp:true});