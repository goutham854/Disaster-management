const mongoose = require('mongoose');

const resourceCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address:{
    type: String,
    required: true
  },
  food: [{
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    expiryDate:{
        type:Date,
        required:true
    }
  }],
  medicine: [{
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  water:[ {
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  amount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('ResourceCenter', resourceCenterSchema);