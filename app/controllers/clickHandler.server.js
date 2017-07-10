'use strict';

var Name = require("../models/names.js");

function clickHandler () {
  
  this.getList = function (req, res) {
    Name
      .find({}, {code: 1, _id: 0})
      .exec(function (err, list) {
        if (list) {
          var arrList = [];
          for(var i=0; i<list.length; i++){
            arrList.push(list[i].code);
          }
          res.send({list: arrList});
        } else {
          res.send({list: []});
        }
      });
  };
  
  this.addStock = function (req, res) {
    var name = new Name(req.body);
    name.save(function (err, res) {
      if (err) { throw err; }
    });
  };
  
  this.deleteStock = function (req, res) {
    Name
      .findOneAndRemove({code: req.params.stock})
      .exec(function (err, list) {
        if (err) { throw err; }
        res.send({deleted: true});
      });
  };
  
}

module.exports = clickHandler;