//different custom events are being created and handled using Socket.io to facilitate real-time communication
// between the server and connected clients.

const io = require("socket.io")(8000, {
  //socket.io is used for establishing connection between frontend and backend and here it is uing port 8000

  cors: {
    //Cross-Origin Resource Sharing
    origin: "http://127.0.0.1:5500", // cors is like security guard
    methods: ["GET", "POST"],
  },
});

const user = {}; //const user = {}; is an object, not an array. It's used to store each client's socket ID

io.on("connection", (socket) => {
  // When a new user joins, log their name and store it
  socket.on("new-user-joined", (uname) => {
    console.log("New user joined event received:", uname);
    user[socket.id] = uname;
    socket.broadcast.emit("user-joined", uname); // Broadcast the user's name to others
  });

  // When a message is sent, broadcast it to all users except the sender sabko messge bhejne wala part hai ye
  socket.on("send", (message) => {
    socket.broadcast.emit("receive", {
      message: message,
      uname: user[socket.id],
    });
  });

  socket.on("disconnect", (message) => {
    socket.broadcast.emit("left", user[socket.id]); //left is even ka name jab ye even hoga to sabko broadcast karna hai ki
    //wo socket.id wala gaya and usko delete karna hai
    delete user[socket.id];
  });
});
