const express = require('express');
const bodyParser = require('body-parser');
const { default: mongoose } = require('mongoose');
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("dotenv").config();
// const db = require('./utils/config.js').get(process.env.NODE_ENV);


// routes
const route = require('./routes/route.js');


// init express app
const app = express();

// parsing data into JSON format.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));  
app.use(cookieParser());


// Handel configs
const { PORT, MONGODB_URI, ORIGIN } = require("./utils/config.js");

// CORS middlewares
app.use("*", cors({ credentials: true, origin: ORIGIN, optionsSuccessStatus: 200 }) );

// index route
app.get("/", (req, res) => {
  res.status(200).json({ type: "success", message: "Server is up and running", data: null });
});

// global error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  const data = err.data || null;
  res.status(status).json({ type: "error", message, data });
});

// routes middlewares
app.use("/", route);


// Database Connection
let URI =  "mongodb+srv://CCAnkit:CCAnkit09@clusternew.gds9x.mongodb.net/Outshade"

mongoose.connect( URI || MONGODB_URI, {     
    useNewUrlParser: true,
  }).then( () => console.log("MongoDb database is connected"))
  .catch ( err => console.log(err) )

// Listen for incoming requests
const PORTs = 3000;

app.listen(PORTs || PORT , function () {
    console.log(`Server listening on port ${PORT}`)    
});


  