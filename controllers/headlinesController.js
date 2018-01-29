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

//global variable
const PAGESPLIT = 5;

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

//next page homepage
router.get("/page/:pageNum", function(req, res){
    mongoConnection.connect();

    db.headlines.find({}).sort({postDate: -1})
    .exec(function(error, results){
        let pageNum = parseInt(req.params.pageNum);

        let pageCount = results.length/PAGESPLIT;
        if(results.length % PAGESPLIT > 0)
            pageCount++;

        let pages = [];
        for(let i = 2; i <= pageCount; i++)
            pages.push(i);

        let next = null;
        if(pageNum+1 <= pageCount)
            next = pageNum+1;

        let previous = null;
        if(pageNum-1 > 0)
            previous = pageNum-1;

        let first = null;
        if(pageNum > 1)
            first = 1;
            
        let last = null;
        if(pageNum != pageCount)
            last = pageCount;

        let pageResults = results.slice(PAGESPLIT*(pageNum-1),PAGESPLIT*pageNum);
        res.render("page", {results:pageResults, pages:pages, previous: previous, next:next, first:first, last:last});
    });
});

//main homepage
router.get("/", function(req, res){
    mongoConnection.connect();

    db.headlines.find({}).sort({postDate: -1})
    .exec(function(error, results){
        let pageCount = results.length/PAGESPLIT;
        if(results.length % PAGESPLIT > 0)
            pageCount++;

        let pages = [];
        for(let i = 2; i <= pageCount; i++)
            pages.push(i);

        let pageResults = results.slice(0,PAGESPLIT);
        res.render("index", {results:pageResults, pages:pages, last:pageCount});
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