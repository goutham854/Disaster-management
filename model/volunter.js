const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VolunteerSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
      },
    email: {
        type: String,
        required: true
    },
   
    phone: {
        type: String,
        required:true
    },
    address: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
      },
    district: {
        type: String,
        required: true
      },
      aadhar:{
        url:String,
        fileename:String
      },
      

    skills: {
        type: String
    },
    availability: {
        type: String
    },
    experience: {
        type: String
    }
});

const Volunteer = mongoose.model('Volunteer', VolunteerSchema);
module.exports = Volunteer;