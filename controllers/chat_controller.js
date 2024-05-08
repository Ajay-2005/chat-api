// chat_controller.js

const { sanitizeMessage, isValidInput } = require("../utils/security");

const activeUsers = new Map(); // Using Map instead of object

/**
 * Handles Socket.IO events related to chat functionality.
 * 
 * @param {object} socket - The socket object.
 * @param {object} io - The Socket.IO server instance.
 */
function handleChatEvents(socket, io) {
  // Handles the 'join-room' event.
  socket.on('join-room', (username, room) => {
    if (isValidInput(username) && isValidInput(room)) {
      activeUsers.set(socket.id, { username, room });
      socket.join(room);
      handleUserGreeting(socket, room, username);
    } else {
      socket.emit('error', 'Invalid username or room');
    }
  });

  // Handles the 'send-message' event.
  socket.on('send-message', (message, room) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      const sanitizedMessage = sanitizeMessage(message);
      socket.broadcast.to(room).emit("new-message", { username: user.username, message: sanitizedMessage });
    }
  });

  // Handles user greetings by broadcasting a 'Hello, I am' message.
  function handleUserGreeting(socket, room, username) {
    socket.broadcast.to(room).emit("hello-message", `Hello, I am ${username}`);
  }

  // Add more event handlers as needed

  // Handle disconnect event
  socket.on('disconnect', () => {
    activeUsers.delete(socket.id);
    // Additional cleanup or logic on disconnect
  });
}

module.exports = handleChatEvents;

