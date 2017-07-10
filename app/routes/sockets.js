'use strict';

module.exports = function (io) {
  
  var clients = 0;
  io.on("connection", function (socket) {
    clients++;
    console.log(clients + " users are connected ");
    socket.on("disconnect", function () {
      clients--;
      console.log(clients + " users are connected ");
    });
});

};