//imports npm packages
const mongoose = require('mongoose');

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Save a reference to the Schema constructor
const Comment = new Schema({
    message: {
        type: String,
        required: true,
        trim: true,
        validate: [
            function(input) {
              return input.trim().length >= 1;
            },
            "comment cannot be empty."
          ]
    }
});

// This creates our model from the above schema, using mongoose's model method
let comment = mongoose.model("Comment", Comment);

// Export the User model
module.exports = comment;