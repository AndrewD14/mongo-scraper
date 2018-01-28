//imports npm packages
const mongoose = require('mongoose');

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Save a reference to the Schema constructor
const Favorite = new Schema({
    user: {
        type: Number,
        required: true,
    },
    list:[
        {
          type: Schema.Types.ObjectId,
          ref: "Headlines"
        }
      ]
});

// This creates our model from the above schema, using mongoose's model method
let favorite = mongoose.model("Favorite", Favorite);

// Export the User model
module.exports = favorite;