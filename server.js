const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// A mock database of user IDs and names
const userDatabase = {
  "N03A11US25": "Sushi",
  "A11N03US25": "Bunny",
};

const reactions = {}; // Store all reactions by messageId
const messages = []; // Store all messages with unique IDs

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user login
  socket.on('login', (userId, callback) => {
    if (userDatabase[userId]) {
      const userName = userDatabase[userId];
      callback({ success: true, name: userName });
    } else {
      callback({ success: false, message: 'Invalid ID. Please try again.' });
    }
  });
 
  // Handle chat message
  socket.on('chat message', (data) => {
    const messageId = `${Date.now()}-${Math.random()}`; // Unique ID for each message
    const messageData = { ...data, messageId };
    messages.push(messageData);
    io.emit('chat message', messageData);
  });

  // Handle emoji reaction
  socket.on('emoji reaction', (data) => {
    const { messageId, emoji } = data;

    if (!reactions[messageId]) {
      reactions[messageId] = {};
    }
    if (!reactions[messageId][emoji]) {
      reactions[messageId][emoji] = 1;
    } else {
      reactions[messageId][emoji]++;
    }

    io.emit('emoji reaction', { messageId, emoji });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});