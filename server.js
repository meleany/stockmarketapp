// Stock Market Chart App by Yasmin Melean 26/06 using MEAN stack.
'use strict';

var express = require("express");
var mongoose = require("mongoose");
var routes = require("./app/routes/index.js");
var socketio = require("./app/routes/sockets.js");
var yahooFinance = require("yahoo-finance");
var bodyParser = require("body-parser");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

// create application/x-www-form-urlencoded parser
//var urlencodedParser = bodyParser.urlencoded({ extended: true });
var jsonParser = bodyParser.json();
app.use(jsonParser);

var path = process.cwd();
app.use("/public", express.static(path + "/public"));
app.use("/controllers", express.static(path + "/app/controllers"));

require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise; // Use to solve mongoose mpromise deprecation warning

socketio(io);
routes(app, yahooFinance, io);

// Starts the server and listens on PORT
// The default routing is 0.0.0.0 represented by :: in IPv6
var PORT = process.env.PORT || 3000;
server.listen(PORT, function(){
  var host = server.address().address;
  if(host == "::") { host =  "0.0.0.0"}
  var port = server.address().port;
  console.log("StockMarketApp running on: http://%s:%s", host, port);
});