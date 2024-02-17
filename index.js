const express=require("express")
const app=express()
const run=require("./config/mongo_connection")
app.get("/",(req,res)=>{
    res.json("hello world");
})
run();
app.listen(5000,'127.0.0.1',()=>{
    console.log("Server running on 5000!")
})