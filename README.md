# Mongo News Headline Scraper

This application runs a website through express to provide the functionality to scrap a website for news article and display on the webpage. A user can save/remove the article to a favorite list and add/remove comments. All data is managed using mongodb on the backend. The wesbite being scraped is https://www.destructoid.com/

## Getting Started

Please visit https://afternoon-eyrie-61915.herokuapp.com/ for a working version.

If you would like to use the code, download the latest and run npm install in the directory. Then node server.js to get the website running. The url will then be localhost:3000

### Prerequisites

You will need the latest version of npm and node installed to be able to get a local version of the code up and running.

## Deployment

If you are looking to deploy, please make sure the connection.js is pulling your ENV variable for the mongodb url 'MONGODB_URI'. Also, make sure you have ENV for PORT.

## Authors

* **Andrew Damico**