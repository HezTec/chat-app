import express from "express";//importing express library

let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http, {
  pingTimeout: 60000000
});
let port = process.env.PORT || 3000;//getting the port




//part of the test code for the hash map--------------TEST----------------
// let userMap = new Map();

let users = [{//array of connected users
  name: '',
  socket: ''
}];//initlizing the user array with empty values so that new values of that type
//can be entered


app.use(express.static('public'))//telling the node.js sever where to get static files like css and images

app.get('/', function(req: any, res: any) {
  res.sendFile(__dirname + '/index.html');//assigning the html file where input comes from
});

io.on('connection', function(socket: any) {

  //getting chat messages from users and emitting them to everyone else
  socket.on('chat message', function(msg: any, ownId: any) {
    console.log('message: ' + msg + 'from: ' + ownId);
    io.emit('chat message', msg, ownId);
  });


  //detecting user disconnections
  socket.on('disconnect', function() {

    //seaching for a user in the users array an removing them upon disconnect
    var count = 0;//count for while loop
    var found = false;//finding the user in the array
    while (found == false) {

      //if the socket disconnecting wasnt in the array it was leftover from the last time
      //the server was ran so we check for undefined here to do nothing when that happens
      if (users[count] == undefined) {
        found = true;
      } else
        if (users[count].socket == socket.id) {
          console.log(users[count].name + ' disconnected');//printing to console who left
          io.emit('join/leave message', users[count].name + ' has left the chat', 'N/A');//sending message to chat who left
          users.splice(count, 1);//removing the socket entry from the array
          found = true;//found the entry in the array
        }
      count++;
    }
  });

  //getting user info once they enter their name and putting it in the array
  socket.on('joined', function(person: string) {

    var personJSON = {
      name: person,
      socket: socket.id
    }

    //test code for using a hash map in place of an array--------------TEST-----------------
    //creating the hashcode and logging the userdata into a map
    // var hashcode = Md5.hashStr(person);
    // var newCode = '';
    // for (var i = 0; i < hashcode.length; i++) {
    //   newCode += hashcode[i];
    // }
    // userMap.set(newCode, personJSON);//setting the user info into the map

    users.push(personJSON);//pushing the json data to the array
    //arrow funciton to sort the json user array by name
    users.sort((n1, n2) => {
      if (n1.name > n2.name) {
        return 1;
      }

      if (n1.name < n2.name) {
        return -1;
      }

      return 0;
    });

    console.log(users);
    io.emit('join/leave message', person + ' has joined the chat!', socket.id)
  });


  //sends a specific socketID the list of current users connected
  socket.on('user_list_request', function() {
    io.to(socket.id).emit('user_list', users);
    console.log("sending user info to " + socket.id);
  });

  socket.on('private message', function(msg: string, sendId: string, ownId: string, ownName: string) {
    //TODO: find the name of who you are sending to in the array from the socket.id
    //and put it in the message to the sender as in "PM to 'insert name here': 'message'"

    var recName = 'unknown';
    for (var i = 0; i < users.length; i++) {
      if (sendId == users[i].socket) {
        recName = users[i].name;
      }
    }

    io.to(sendId).emit('private message', 'PM From ' + ownName + msg);
    io.to(ownId).emit('private message', 'PM to ' + recName + msg);
  });

  //prototype code to send the map as a json array string to be---------TEST----------
  //converted to a map later on using JSON.parse()
  // socket.on('user_list_request', function() {
  //   let transitStr = JSON.stringify(Array.from(userMap));
  //   io.to(socket.id).emit('user_list', transitStr);
  // });

});


http.listen(port, function() {
  console.log('listening on *:3000');
});
