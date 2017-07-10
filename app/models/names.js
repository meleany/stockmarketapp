'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Name = new Schema({
  code: String
});

module.exports = mongoose.model("Name", Name);