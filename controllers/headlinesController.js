//imports npm packages
const express = require("express");
const mongojs = require("mongojs");

//imports loacl files
const db = require('../models/mongoDbModels.js');
const mongoConnection = require('../connection/connection.js');
//const mmorpgHeadlines = require('./appFunc/mmorpgNewsScraper.js');
const destructoidHeadlines = require('./appFunc/destructoidScraper.js');

//creates the router controller from the express servers
let router = express.Router();


//function that inserts recursively
let headlineInsert = function(links, index, res){
   // console.log(links[index])
    db.headlines.init().then(function(){
        db.headlines.create(links[index])
        .then(function(results){
            if(index < links.length-1)
                headlineInsert(links, index+1, res);
            else
                res.redirect("/");
        })
        .catch(function(error){
            if(error.code == 11000){
                if(index < links.length-1)
                    headlineInsert(links, index+1, res);
                else
                    res.redirect("/");
            }
            else
                res.json({status: 'failed', insertCount: index, errorMsg:error});
        });
    });
}

//starts the request to scrap for new news
router.get("/scrap", function(req, res){
    destructoidHeadlines.grabNews(function(results){
       //console.log("links: "+results)
       mongoConnection.connect();

       headlineInsert(results, 0, res);
   },1,null,[]);
});

//pulls up 1 news article with comments
router.get("/:id", function(req, res){
    mongoConnection.connect();

    db.headlines.find({_id: mongojs.ObjectId(req.params.id)}).then(function(results){
        res.render("comments", {results:results});
    });
});

//main homepage
router.get("/", function(req, res){
    mongoConnection.connect();

    db.headlines.find({}).sort({postDate: -1}).limit(10).then(function(results){
        res.render("index", {results:results});
    });
});

// Export routes for server.js to use.
module.exports = router;