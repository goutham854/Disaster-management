const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const opts={toJSON:{virtuals:true}};

const alertSchema=new Schema({
    disaster:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    districts:{
        type:[String]
    },
    description:{
        type:String,
        required:true
    },
    
 geometry:{
    type:{
        type:String,
        enum:['Point'],
        required:true
    },
    coordinates:{
        type:[Number],
        required:true
    }
},
    expectedDateTime:{
        type:Date
    }

},opts)


alertSchema.virtual('properties.popUpMarkup').get(function(){
    // return `<a href="/alerts/${this._id}">${this.disaster}</a>`
    return `${this.disaster}`
})

const Alert=mongoose.model('Alert',alertSchema);
module.exports=Alert;