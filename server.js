// Stock Market Chart App by Yasmin Melean 26/06 using MEAN stack.
'use strict';

var express = require("express");
var routes = require("./app/routes/index.js");
var yahooFinance = require("yahoo-finance");
var app = express();

var path = process.cwd();
app.use("/public", express.static(path + "/public"));
app.use("/controllers", express.static(path + "/app/controllers"));

routes(app, yahooFinance);

// Starts the server and listens on PORT
// The default routing is 0.0.0.0 represented by :: in IPv6
var PORT = process.env.PORT || 3000;
var server = app.listen(PORT, function(){
  var host = server.address().address;
  if(host == "::") { host =  "0.0.0.0"}
  var port = server.address().port;
  console.log("StockMarketApp running on: http://%s:%s", host, port);
});