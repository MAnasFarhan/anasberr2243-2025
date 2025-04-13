const express = require('express');
const { MongoClient , ObjectId} = require('mongodb');
const port = 3000;

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

// GET /users - fetch all rides
app.get('/users', async (req, res) => {
    try{
        const rides = await db.collection('users').find().toArray();
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

//POST /rides - create a new ride
app.post('/users', async (req, res) => {
    try {
        const result = await db.collection('users').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ error: "Invalid user data" });
    }
});

//PATCH /rides/:id - Update ride status
app.patch('/users/:id', async (req, res) => {
    try {
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { 
                UserPassword: req.body.UserPassword,
                //UserName: req.body.UserName,
                //UserEmail: req.body.UserEmail
            } }
        );
        
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ updated: result.modifiedCount });

    }   catch (err) {
        //Handle invalid ID format or DB errors
        res.status(400).json({ error: "Invalid user ID or data" });
    }
});

//DELETE /rides/:id - Cancel a ride
app.delete('/users/:id', async (req, res) => {
    try{
        const result = await db.collection('users').deleteOne(
            { _id: new ObjectId(req.params.id) }
        );

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ deleted: result.deleteCount });

    }   catch (err) {
        res.status(400).json({ error: "Invalid user ID" });
    }
});