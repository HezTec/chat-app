//promting the user to enter a username before entering chat
window.onload = load;


var person;//variable to save the users username
var filter = /^[A-Za-z0-9]+$/;//filter for usernames
var userList = [];
var socket = io.connect();//the socket object

/*
  load fucntion for window.onload
*/
function load() {
  //this line will request the users array in index.ts and send back a user_list function in the socket
  socket.emit('user_list_request');

  //this filter seciton isnt done yet, it still allows for duplicate names
  var nameCheck = true;//variable to see if the name is valid
  while (nameCheck == true) {

    person = prompt("enter a username between 3 & 15 characters (letters & numbers)", "anon");


    // cheching null     checking length is between 3 and 15         checking for no special characters
    if (person == null || person.length < 3 || person.length > 15 || filter.test(person) == false) {
      alert("invalid username");
      // person = prompt("enter a username between 3 & 15 characters (letters & numbers)", "anon");
    } else {
      nameCheck = false;
      //sending username to the server
      socket.emit('joined', person);
    }
  }

}
/*
  this function prepares a private message in the chat form
*/
function displayId(ownId) {
  $('#m').val('/p ' + ownId + ' ');
}

/*
  this function serilizes the pictures and sends data to the server
*/
function sendPic() {
  var ownId = socket.id;//your own id to be sent
  var dataUrl = document.getElementById('canvas').toDataURL();
  socket.emit('sendPic', dataUrl, ownId);

}


//sending messages typed locally to the socket
$(function() {
  var userList = [];//the list of current users on the channel

  //gets the current user list and saves it in the userList global variable
  socket.on('user_list', function(users) {
    for (var i = 0; i < users.length; i++) {
      userList[i] = users[i];
    }
  });


  //getting the message from the user and sending it to the server
  $('form').submit(function(e) { //getting the message info from the html form
    e.preventDefault(); // prevents page reloading after entring the form

    var ownId = socket.id;//your own id to be sent

    //scanning for if the user sent a private message with /p
    if ($('#m').val().substring(0, 3) == '/p ') {

      var pMessage = ': ' + $('#m').val().substring(23);//the message to be sent
      var pId = $('#m').val().substring(3, 23);//the id to send the private message
      var ownName = person;//senders name
      socket.emit('private message', pMessage, pId, ownId, ownName);

    } else if ($('#m').val() != '') {//not sending input if the field is empty
      socket.emit('chat message', person + ': ' + $('#m').val(), ownId);//sending the message to the server
    }
    if ($('#m').val().substring(0, 3) != '/p ') {
      $('#m').val(''); //clearing the users text form after they submit a regular message
    } else {
      $('#m').val($('#m').val().substring(0, 23) + ' ');//keeping the PM command after sending a PM
    }
    return false;
  });


  //calling the socket for join/leave events and posting them to the window
  socket.on('join/leave message', function(msg, ownId) {

    //adding the message to the feed and setting the function to start a pm
    $('#messages').append($("<li style=\"color:blue;\" onclick='displayId(\"" + ownId + "\");'>").text(msg));
    window.scrollTo(0, document.body.scrollHeight); // auto scrolling to the bottom of the screen after each chat
  });



  //calling the socket for chat messages and posting them
  socket.on('chat message', function(msg, ownId) {
    //checking to make sure the message isnt empty
    if (msg != person + ": ") {

      //adding the message to the feed and setting the function to start a pm
      $('#messages').append($("<li onclick='displayId(\"" + ownId + "\");'>").text(msg));
      window.scrollTo(0, document.body.scrollHeight); // auto scrolling to the bottom of the screen after each chat
    }
  });

  //calling the socket for chat messages and posting them
  socket.on('private message', function(msg) {
    //checking to make sure the message isnt empty
    if (msg != person + ": ") {
      $('#messages').append($('<li style=\"color:red;\">').text(msg)); //printing the message & username
      window.scrollTo(0, document.body.scrollHeight); // auto scrolling to the bottom of the screen after each chat
    }
  });

  socket.on('sendPicAll', function(dataUrl, ownId) {
    var img = new Image();
    img.onload = start;
    img.src = dataUrl;

    function start() {
      $('#messages').append($("<li onclick='displayId(\"" + ownId + "\");'>").text(img));
    }
  });

});
