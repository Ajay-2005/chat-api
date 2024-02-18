const { MongoClient } = require("mongodb");
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const dbName = "chat";

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db(dbName).command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        return client.db(dbName);
    } catch (err) {
        console.log(err);
        throw err; // Rethrow the error to handle it in the calling code
    }
}

module.exports = run;
