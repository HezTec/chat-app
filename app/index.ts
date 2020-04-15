import express from "express";//importing express library

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;//getting the port

app.use(express.static('public'))//telling the node.js sever where to get static files like css and images

app.get('/', function(req: any, res: any) {
  res.sendFile(__dirname + '/index.html');//assigning the html file where input comes from
});

//detecting user connections
io.on('connection', function(socket: any) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

//getting chat messages from users and emitting them to everyone else
io.on('connection', function(socket: any) {
  socket.on('chat message', function(msg: any) {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});

http.listen(port, function() {
  console.log('listening on *:3000');
});
