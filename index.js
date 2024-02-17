const express=require("express")
const app=express()

app.get("/",(req,res)=>{
    res.json("hello world");
})

app.listen(5000,'127.0.0.1',()=>{
    console.log("server running on 5000")
})