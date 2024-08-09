const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reqSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    image:
      {
          url:String,
          filename:String
      }
  ,
    quantity:{
        type:String,
        required:true
    },
    user: {
        type:mongoose.Schema.Types.ObjectId,
         href:"User"
    },
    username: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true,
        
      },
      
          address: {
            type: String,
            required: true
          },
          district:{
            type: String,
            required: true
          }

})

const Request=mongoose.model('Request',reqSchema);
module.exports=Request;