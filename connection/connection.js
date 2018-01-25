//imports npm packages
const mongoose = require('mongoose');

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;

//function used to tell the server to connect if the connection is not open
module.exports.connect = function(){
    mongoose.connect(MONGODB_URI);
}