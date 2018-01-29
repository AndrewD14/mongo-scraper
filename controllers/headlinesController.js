//imports npm packages
const express = require("express");
const mongojs = require("mongojs");
const dateFormat = require("dateformat")

//imports loacl files
const db = require('../models/mongoDbModels.js');
const mongoConnection = require('../connection/connection.js');
//const mmorpgHeadlines = require('./appFunc/mmorpgNewsScraper.js'); //disabled due to getting hit with a reCaptcha
const destructoidHeadlines = require('./appFunc/destructoidScraper.js');

//creates the router controller from the express servers
let router = express.Router();

//global variable
const PAGESPLIT = 5;

//function that inserts recursively
let headlineInsert = function(links, index, res){
   let count = 0;
    db.headlines.init().then(function(){
        db.headlines.create(links[index])
        .then(function(results){
            count++;
            if(index < links.length-1)
                headlineInsert(links, index+1, res);
            else
                res.json({status:"OK", insert: count});
        })
        .catch(function(error){
            if(error.code == 11000){
                if(index < links.length-1)
                    headlineInsert(links, index+1, res);
                else
                    res.json({status:"OK", insert: count});
            }
            else{
                console.log(error);
                res.json({status: 'failed'});
            }
        });
    });
}

//starts the request to scrap for new news
router.get("/scrap", function(req, res){
    destructoidHeadlines.grabNews(function(results){
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
        if(results)
            results.postDt = dateFormat(results.postDate, "dddd, mmmm dS, yyyy", false, false);
        res.render("comments", results);
    });
});

//next page homepage
router.get("/page/:pageNum", function(req, res){
    mongoConnection.connect();

    db.headlines.find({}).sort({postDate: -1})
    .exec(function(error, results){
        if(results){
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

            for(i in pageResults)
                pageResults[i].postDt = dateFormat(pageResults[i].postDate, "dddd, mmmm dS, yyyy", false, false);
        }
        res.render("page", {results:pageResults, pages:pages, previous: previous, next:next, first:first, last:last});
    });
});

//loads the favorite page
router.get("/fav/:id", function(req, res){
    mongoConnection.connect();

    db.favorite.findOne({'user': req.params.id})
    .populate("list")
    .exec(function(error,results){
        if(results)
            for(i in results.list)
                results.list[i].postDt = dateFormat(results.list[i].postDate, "dddd, mmmm dS, yyyy", false, false);
        res.render("favorites", {results:results});
    });
});

//main homepage
router.get("/", function(req, res){
    mongoConnection.connect();

    db.headlines.find({}).sort({postDate: -1})
    .exec(function(error, results){
        let pageResults = [];
        if(results){
            let pageCount = results.length/PAGESPLIT;
            if(results.length % PAGESPLIT > 0)
                pageCount++;

            let pages = [];
            for(let i = 2; i <= pageCount; i++)
                pages.push(i);

            let pageResults = results.slice(0,PAGESPLIT);

            for(i in pageResults)
                pageResults[i].postDt = dateFormat(pageResults[i].postDate, "dddd, mmmm dS, yyyy", false, false);
        }
        res.render("index", {results:pageResults, pages:pages, last:pageCount});
    });
});

//add to fav
router.post("/addFav/:id", function(req, res){
    mongoConnection.connect();

    //did not implement a log in function. (Defaulting to a value of 1 for first user)
    db.favorite.findOneAndUpdate({user: 1}, {$push: {list: mongojs.ObjectId(req.params.id)}}, {upsert:true})
    .then(function(dbFavorite){
        res.redirect("/fav/1");
    })
    .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
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

//remove favorite
router.post("/remove-fav/:id", function(req, res){
    mongoConnection.connect();
    let user = req.headers.referer.substring(req.headers.referer.lastIndexOf("/")+1);

    db.favorite.findOneAndUpdate({'user': user}, {$pull: {list: mongojs.ObjectId(req.params.id)}})
    .then(function(dbfavorite){
        res.redirect("/fav/"+user);
    })
    .catch(function(err) {
        // If an error occurs, send it back to the client
        res.json(err);
    });
});

// Export routes for server.js to use.
module.exports = router;