const express = require("express");
const app = express();
const run = require("./config/mongo_connection");
run();
const user_router = require("./routes/users");

app.get("/", (req, res) => {
    res.json("hello world");
});

app.use("/", user_router);



const PORT = 5000;
const HOST = '127.0.0.1';

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
