//imports npm packages
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require("express-handlebars");
const path = require('path');

const PORT = process.env.PORT || 3000;

// Initialize Express
let app = express();


// Configure middleware

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(path.join(__dirname,"public")));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
const routes = require('./controllers/headlinesController.js');

//sets the engine to use the routes
app.use("/", routes);

app.listen(PORT);