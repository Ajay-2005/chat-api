const run=require("./mongo_connection");
async function collections(){
    const client=await run();
    const collection={
        usercollection:client.collection("users"),
        chatcollection:client.collection("chat")
    }
    return collection
}
module.exports=collections