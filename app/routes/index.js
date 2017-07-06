'use strict';

var path = process.cwd();

module.exports = function (app, yahooFinance) {
  
  app.route("/")
    .get(function (req, res) {
      res.sendFile(path + "/public/main.html");
    });

  app.route("/api/market/:stock/:start/:end")
    .get(function (req, res) {
      /*yahooFinance.historical({
        symbol: req.params.stock,
        from: req.params.start,
        to: req.params.end
        }, function (err, results) {
          console.log(JSON.stringify(results));
          res.send({data: results});
      });*/
      res.send({ans: 1000});
    });
};