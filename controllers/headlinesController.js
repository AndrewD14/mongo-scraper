//imports npm packages
const express = require("express");

//imports loacl files
const headlinesModel = require('../models/headlinesModel.js');
const mongoConnection = require('../connection/connection.js');
const mmorpgHeadlines = require('./appFunc/mmorpgNewsScraper.js');

//creates the router controller from the express servers
let router = express.Router();


//function that inserts recursively
let headlineInsert = function(links, index, res){
   // console.log(links[index])
    headlinesModel.init().then(function(){
        headlinesModel.create(links[index])
        .then(function(results){
            if(index < links.length-1)
                headlineInsert(links, index+1, res);
            else
                res.json({status: "ok", msg: "Completed the scraping"});
        })
        .catch(function(error){
            if(error.code == 11000){
                if(index < links.length-1)
                    headlineInsert(links, index+1, res);
                else
                    res.json({status: "ok", msg: "Completed the scraping 1"});
            }
            else
                res.json({status: 'failed', insertCount: index, errorMsg:error});
        });
    });
}


router.get("/", function(req, res){
    mongoConnection.connect();

    headlinesModel.find({}).limit(15).then(function(results){
        res.render("index", {results:results});
    });
});

// router.get("/", function(req, res){
//      mmorpgHeadlines.grabNews(function(results){
//         //console.log("links: "+results)
//         mongoConnection.connect();

//         headlineInsert(results, 0, res);
//     },0,null,[]);
// });

// Export routes for server.js to use.
module.exports = router;