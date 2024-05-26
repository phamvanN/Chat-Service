const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const messageSchema = new mongoose.Schema({
  room: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

mongoose.connect(process.env.DB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 // 30 Sekunden Timeout
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join room', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);

    Message.find({ room }).then(messages => {
      socket.emit('previous messages', messages);
    });
  });

  socket.on('chat message', ({ room, message }) => {
    const encryptedMessage = CryptoJS.AES.encrypt(message, process.env.SECRET_KEY).toString();
    const msg = new Message({ room, message: encryptedMessage });

    msg.save().then(() => {
      io.to(room).emit('chat message', {
        room,
        message: CryptoJS.AES.decrypt(encryptedMessage, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8)
      });
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});
