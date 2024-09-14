//storing a Socket.IO client instance in the socket variable.
//this instance actually represnets active connection between server and client

//io is used to create a connection to a Socket.IO server. When you call io("http://localhost:8000"),
//you are telling the client to connect to the server at that address.

const socket = io("http://localhost:8000", {
  transports: ["websocket", "polling"], // Adding websocket as the preferred transport then polling
});

// getElementById used to access HTML elements in a webpage

const form = document.getElementById("send-container"); //form ke liye send-container wala section
const messageInput = document.getElementById("messageInp"); //input message ke liye messageInp wala
const messageContainer = document.querySelector(".container"); //it slects using css class
// using document.querySelector is often done to dynamically change the content, style, or behavior of web pages
var audio = new Audio("ting.mp3");

//creating div for each message and appending it to the container
const append = (message, position) => {
  //this is append function
  const messageElement = document.createElement("div"); //ek div bana lenge taki new user ko dikha sake
  messageElement.innerText = message; //content of div is our message
  messageElement.classList.add("message"); //adding css class
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
  if (position == "left") {
    audio.play();
  }
};

//send ka button dabane pe kya hoga
form.addEventListener("submit", (e) => {
  e.preventDefault(); //baar baar reload hone se rokega
  const message = messageInput.value;
  //`` ye template literals hai inse variable so string ke bich me daal sakte hai
  append(`You: ${message}`, "right");
  socket.emit("send", message);
  //to empty the input filed
  messageInput.value = "";
});

const uname = prompt("Enter your name to Join");
socket.emit("new-user-joined", uname); //new user join kiya toh uska name lo and sabko batao

//koi nwe user join karta hai toh wo event listem kareke ye usse show karega
socket.on("user-joined", (uname) => {
  append(`${uname} joined the chat`, "right");
});

//message ka len den
socket.on("receive", (data) => {
  append(`${data.uname}: ${data.message}`, "left");
});

socket.on("left", (uname) => {
  append(`${uname} left the chat`, "left");
});
