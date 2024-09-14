const io = require("socket.io")(8000, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
  },
});
const crypto = require('crypto');
const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/chatDB');


// Define a schema for storing messages
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
});

const Message = mongoose.model('Message', messageSchema);

// AES Encryption functions
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const users = {};

io.on('connection', (socket) => {
  socket.on('new-user-joined', (uname) => {
    console.log('New user joined event received:', uname);
    users[socket.id] = uname;
    socket.broadcast.emit('user-joined', uname);
  });

  socket.on('send', (message) => {
    const encryptedMessage = encrypt(message); // Encrypt the message
    const newMessage = new Message({
      username: users[socket.id],
      message: JSON.stringify(encryptedMessage), // Save the encrypted message
    });

    newMessage.save().then(() => {
      console.log('Message saved to database');
    }).catch(err => {
      console.error('Error saving message:', err);
    });

    socket.broadcast.emit('receive', {
      message: message, // This will be sent as plain text (you can send encrypted if needed)
      uname: users[socket.id],
    });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('left', users[socket.id]);
    delete users[socket.id];
  });
});
