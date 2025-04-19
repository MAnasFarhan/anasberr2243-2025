const express = require('express');
const { MongoClient , ObjectId} = require('mongodb');
const port = 3000;

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

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
app.get('/rides', async (req, res) => {
    try{
        const rides = await db.collection('rides').find().toArray();
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch ride" });
    }
});

//POST /rides - create a new ride
app.post('/rides', async (req, res) => {
    try {
        const result = await db.collection('rides').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ error: "Invalid user data" });
    }
});

//PATCH /rides/:id - Update ride status
app.patch('/rides/:id', async (req, res) => {
    try {
        const result = await db.collection('rides').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status: req.body.status
            } }
        );
        
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Ride not found"});
        }
        res.status(200).json({ updated: result.modifiedCount });

    }   catch (err) {
        //Handle invalid ID format or DB errors
        res.status(400).json({ error: "Invalid user ID or data" });
    }
});

//DELETE /rides/:id - Cancel a ride
app.delete('/rides/:id', async (req, res) => { // Handles DELETE req to remove a ride or user by ID
    
    try {
        const result = await db.collection('rides').deleteOne( // Deletes the ride with the matching ID from the db
            { _id: new ObjectId(req.params.id) }
        );

        if (result.deletedCount === 0) { // if nothing was deleted, the ride probably didn't exist - return 404
            return res.status(404).json({ error: "Ride not found"});
        }
        res.status(200).json({ deleted: result.deletedCount}); // on succes, res with hoe many rides were deleted

    } catch (err) { // catch & return 400 Bad req for invalid IDs / other errors
        res.status(400).json({ error: "Invalid ride ID" });
    }
});