const express = require("express");
const app = express();
const http = require('http'); 
const socketIO = require('socket.io');

const server = http.createServer(app); 
const io = socketIO(server); 

const user_router = require("./routes/users");
const { emit } = require("process");
const { Socket } = require("dgram");

app.get("/", (req, res) => {
    res.json("hello world");
});

app.use("/", user_router);



io.on('connection', (socket) => { 
    console.log('A user connected')
    socket.on("message",(msg)=>{
        console.log("message:"+msg)
        io.emit("recieved message",msg)

    })
})

const PORT = 5000;
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
