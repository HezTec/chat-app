//promting the user to enter a username before entering chat
window.onload = load;
var person;//variable to save the users username
function load() {

  //making sure the users username is between 3 and 15 characters and not null
  person = prompt("enter a username between 3 & 15 characters", "anon");
  while (person == null || person.length < 3 || person.length > 15) {
    person = prompt("enter a username between 3 & 15 characters", "anon");
  }
}

//sending messages typed locally to the socket
$(function() {
  var socket = io();
  $('form').submit(function(e) {//getting the message info from the html form
    e.preventDefault(); // prevents page reloading after every message
    socket.emit('chat message', person + ": " + $('#m').val());
    $('#m').val('');//clearing the users text form after they submit a message
    return false;
  });
  //calling the socket for chat messages and posting them
  socket.on('chat message', function(msg) {
    //checking to make sure the message isnt empty
    if (msg != person + ": ") {
      $('#messages').append($('<li>').text(msg)); //printing the message & username
      window.scrollTo(0, document.body.scrollHeight); // auto scrolling to the bottom of the screen after each chat
    }
  });
});
