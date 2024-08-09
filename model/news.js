const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    writtenDate:{
        type:Date,
        required:true
    }
})

const News=mongoose.model('News',newsSchema);
module.exports=News;