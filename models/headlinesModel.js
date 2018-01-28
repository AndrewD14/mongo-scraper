const mongoose = require('mongoose');

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

const Headlines = new Schema({
  headlines: {
    type: String,
    trim: true,
    required: true
  },
  summary: {
    type: String,
    trim: true,
    required: true
  },
  url: {
    type: String,
    unique: true,
    required: true
  },
  imgURL: {
    type: String
  },
  postDate: {
    type: Date,
    required: true
  },
  source: {
    type: String,
    required: true
  }
});

// This creates our model from the above schema, using mongoose's model method
let headlines = mongoose.model("Headlines", Headlines);

// Export the User model
module.exports = headlines;
