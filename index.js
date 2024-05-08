const express = require("express");
const app = express();
const http = require('http'); 
const socketIO = require('socket.io');
const handleChatEvent = require("./controllers/chat_controller");
const server = http.createServer(app); 
const io = socketIO(server); 

const user_router = require("./routes/users");
const chat_router = require('./routes/chat')

app.get("/", (req, res) => {
    res.json("hello world");
});

app.use("/", user_router);
app.use("/chat", chat_router);

io.on('connection', (socket) => { 
    console.log(socket)
    console.log('A user connected');
    handleChatEvent(socket, io); // Pass io instance to handleChatEvent
});

const PORT = 5000;
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

module.exports = { io }; // Export io instance for use in other modules
