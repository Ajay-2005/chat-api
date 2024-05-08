const authMiddleware=require("../middleware/auth_middleware")
const express=require("express")
const router = express.Router()
const {io}=require("../index")
router.post("/join-room", authMiddleware, (req, res) => {
    const { username, room } = req.body
    io.emit('join-room', username, room);
    res.json({ success: true, message: `joined room $(room)` })
})
router.post('/send-message', authMiddleware, (req, res) => {
    const { message, room } = req.body;
    // Logic to send a message (e.g., emit 'sendMessage' event using Socket.IO)
    io.emit('sendMessage', message, room); // Broadcast to all connected sockets in the room
    res.json({ success: true, message: 'Message sent' });
});
module.exports=router