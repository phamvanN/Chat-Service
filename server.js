const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Message = require('./models/message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use(cors());
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    io.to(room).emit('message', { username: 'System', text: `${username} has joined the room` });
  });

  socket.on('chatMessage', (msg) => {
    const message = new Message({
      username: msg.username,
      text: msg.text,
      room: msg.room,
      createdAt: new Date(),
    });

    message.save().then(() => {
      io.to(msg.room).emit('message', msg);
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
