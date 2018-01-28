//imports npm packages
const request = require("request-promise");
const cheerio = require("cheerio");

const grabNews = function(cb, pageNum, html, results){
    let url = "";
    if(!html)
        url = "https://www.destructoid.com";
    else
        url = html;

    request(url, function(error, response, html) {
        let baseURL = "https://www.destructoid.com/";

        let $ = cheerio.load(html);
        $(".smlpost").each(function(i, element) {
            if(i != 0){
                //get the content
                let newsContent = $(element).find(".smlpost-content");

                //get the title and link
                let newsTitle = newsContent.find(".sparticle_title").children().eq(0).text();
                let newsLink = newsContent.find(".sparticle_title").children().eq(0).attr("href");

                //get the posted date
                let postDate = newsContent.find(".smlpost-datetime").text()+", 2018";

                //gets summary
                let newsSummary = newsContent.find(".smlpost-story").children().eq(0).text();

                //get image
                let newsImage = $(element).find(".smlpost-img").children().eq(0).children().eq(0).attr("data-src");


                //console.log(newsTitle);
                //console.log(newsLink);
                //console.log(newsImage);
                //console.log(newsSummary);
                //console.log(Date.parse(postDate));

                // Save these results in an object that we'll push into the results array we defined earlier
                results.push({
                    headlines: newsTitle,
                    summary: newsSummary,
                    url: baseURL+newsLink,
                    imgURL: newsImage,
                    postDate: Date.parse(postDate),
                    source: "DESTRUCTOID"
                });
            }
        });

        //disabled the recursive as this site dynamically loads additonal news items when reaching end of the page
        //if(pageNum < 0)
            //using a timeout to slow the website crawler to be nice to the server
            //setTimeout(grabNews(cb, pageNum+1, "https://www.destructoid.com//"+pageNum, results),1500);
        //else
            cb(results);
    });
};

module.exports.grabNews = grabNews;