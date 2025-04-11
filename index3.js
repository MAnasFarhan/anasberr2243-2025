const express = require('express');
const { MongoClient } = require('mongodb');
const port = 3000

const app = express();
app.use(express.json());

let db;

async function connectToMongoDB(){
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        db = client.db("testDB");
    }   catch (err) {
        console.error("Error:", err);
    }
}
connectToMongoDB();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// GET /rides - fetch all rides
app.get('/rider', async (req, res) => {
    try{
        const rides = await db.collection('rides').find().toArray();
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch rides" });
    }
});