'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var expect      = require('chai').expect;
var cors        = require('cors');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');
var helmet=require('helmet');
var mongoose = require('mongoose');
var connectionUrl='mongodb+srv://shyamkathir:Shyamsharmi007@cluster0.byojbkp.mongodb.net/freecodecamp?retryWrites=true&w=majority';
var app = express();
mongoose.connect(connectionUrl,({useNewUrlParser:true, useUnifiedTopology:true}))
.then(()=>{
  console.log('Connected to Database');

  app.use('/public', express.static(process.cwd() + '/public'));
  app.use('/fa',express.static(__dirname+'/node_modules/font-awesome/css'));
  app.use('/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts'));
  app.use('/jquery',express.static(__dirname+'/node_modules/jquery/dist'))
  app.use(cors({origin: '*'})); //For FCC testing purposes only
  
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  app.use(helmet.contentSecurityPolicy({directives:{
    defaultSrc: ["'self'"],
    scriptSrc:["'self'"]
  }}));
  app.use(helmet());
  
  //Index page (static HTML)
  app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    });
  
  //For FCC testing purposes
  fccTestingRoutes(app);
  
  //Routing for API 
  apiRoutes(app);  
      
  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
  
  //Start our server and tests!
  app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port " + process.env.PORT);
    // process.env.NODE_ENV='test'
    if(process.env.NODE_ENV==='test') {
      console.log('Running Tests...');
      setTimeout(function () {
        try {
          runner.run();
        } catch(e) {
          var error = e;
            console.log('Tests are not valid:');
            console.log(error);
        }
      }, 3500);
    }
  });
  
  module.exports = app; //for testing  
})
.catch((err)=>{
  console.log('Failed to connect to Database')
  console.error(err);
})
