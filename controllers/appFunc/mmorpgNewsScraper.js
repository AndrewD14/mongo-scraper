//imports npm packages
const request = require("request-promise");
const cheerio = require("cheerio");

const grabNews = function(cb, pageNum, html, results){
    let url = "";
    if(!html)
        url = "https://www.mmorpg.com/news";
    else
        url = html;

    request(url, function(error, response, html) {
        let $ = cheerio.load(html);

        $(".newsfeed .newsitem").each(function(i, element) {
            //general html url
            let baseURL = "https://www.mmorpg.com";

            //get the news item
            let newsItem = $(element).find(".nrup");

            //get the h1 tag where title is located
            let newsH1 = newsItem.find(".info").children().eq(0);

            //get the title and link
            let newsTitle = newsH1.children().eq(0).text();
            let newsLink = newsH1.children().eq(0).attr("href");

            //gets news post
            let newsPost = newsItem.find(".news_newspost");

            //get image
            let newsImage = "https:"+newsPost.children().eq(0).children().eq(0).attr("src");

            //get summary
            let newsSummary = newsPost.children().eq(1).text();

            // console.log(newsTitle);
            // console.log(newsLink);
            // console.log(newsImage);
            // console.log(newsSummary);

            // Save these results in an object that we'll push into the results array we defined earlier
            results.push({
                headlines: newsTitle,
                summary: newsSummary,
                url: baseURL+newsLink,
                imgURL: newsImage
            });
        });

        if(pageNum < 21)
            grabNews(cb, pageNum+1, "https://www.mmorpg.com/news/page/"+pageNum, results);
        else
            cb(results);
    });
};

module.exports.grabNews = grabNews;