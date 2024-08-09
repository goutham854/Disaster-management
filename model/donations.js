const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const donationSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    district:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    itemName:{
        type:String,
        required:true
    },
    quantity:{
        type:String,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    isRecieved:{
        type:Boolean,
        default:false
    }
})

const Donation=mongoose.model("Donation",donationSchema);
module.exports=Donation;