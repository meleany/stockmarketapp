'use strict';

var path = process.cwd();
var ClickHandler = require(path + "/app/controllers/clickHandler.server.js");

module.exports = function (app, yahooFinance, io) {
  
  var clickHandler = new ClickHandler();
  
  app.route("/")
    .get(function (req, res) {
      res.sendFile(path + "/public/main.html");
    });

  app.route("/api/market/:stock/:start/:end")
    .get(function (req, res) {
      yahooFinance.historical({
        symbol: req.params.stock,
        from: req.params.start,
        to: req.params.end
        }, function (err, results) {
          res.send({data: results});
      });
    });
  
  app.route("/api/list")
    .get(clickHandler.getList)
    .post(function (req, res) {
      io.sockets.emit('socketadd', req.body);        
      clickHandler.addStock(req, res);
    });
  
  app.route("/api/:stock")
    .get(function (req, res) {
      io.sockets.emit("socketremove", {code: req.params.stock});
      clickHandler.deleteStock(req, res);
    });

  //console.log("route " + JSON.stringify(req.body)); Remember for what to pass ...
};