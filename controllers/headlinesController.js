//imports npm packages
const express = require("express");

//imports loacl files
const headlinesModel = require('../models/headlinesModel.js');
const mongoConnection = require('../connection/connection.js');

//creates the router controller from the express servers
let router = express.Router();

router.get("/", function(req, res){
    mongoConnection.connect();

    headlinesModel.init().then(function(){
        headlinesModel.create({
            headlines:"test",
            summary: "more test",
            url: "another test part"
        })
        .then(function(results){
            res.json(results);
        })
        .catch(function(error){
            res.json(error);
        });
    });
});




// Export routes for server.js to use.
module.exports = router;