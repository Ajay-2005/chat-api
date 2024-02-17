const { MongoClient } = require("mongodb")
const uri = "mongodb://127.0.0.1:27017"
const client = new MongoClient(uri)

const dbName = "chat"
async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db(dbName).command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.log(err)
    }
}

module.exports=run;