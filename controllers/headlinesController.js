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
router.get("/article/:id", function(req, res){
    mongoConnection.connect();

    db.headlines.findOne({'_id': mongojs.ObjectId(req.params.id)})
    .populate("comments")
    .exec(function(error,results){
        res.render("comments", results);
    });
});

//main homepage
router.get("/", function(req, res){
    mongoConnection.connect();

    db.headlines.find({}).sort({postDate: -1}).limit(10).then(function(results){
        res.render("index", {results:results});
    });
});

//insert new comments
router.post("/newComment/:id", function(req, res){
    mongoConnection.connect();

    db.comment.create(req.body)
    .then(function(dbComment){
        return db.headlines.findOneAndUpdate({'_id': mongojs.ObjectId(req.params.id)}, {$push: {comments: dbComment._id}}, {new: true});
    })
    .then(function(dbHeadlines){
        res.redirect("/article/"+dbHeadlines._id);
    })
    .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
    });
});

//remove comments
router.post("/remove-comment/:id", function(req, res){
    mongoConnection.connect();
    let articleId = req.headers.referer.substring(req.headers.referer.lastIndexOf("/")+1);

    db.comment.remove({'_id': mongojs.ObjectId(req.params.id)})
    .then(function(dbComment){
        return db.headlines.findOneAndUpdate({'_id': mongojs.ObjectId(articleId)}, {$pull: {comments: mongojs.ObjectId(req.params.id)}});
    })
    .then(function(dbHeadlines){
        res.redirect("/article/"+dbHeadlines._id);
    })
    .catch(function(err) {
        // If an error occurs, send it back to the client
        res.json(err);
    });
});

// Export routes for server.js to use.
module.exports = router;