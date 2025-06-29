const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let db;

async function start() {
    try {
        await client.connect();
        db = client.db('MyTaxi');
        console.log("Connected to MongoDB");
        app.listen(3000, () => console.log("Server running on http://localhost:3000"));
    } catch (err) {
        console.error(err);
    }
}
start();

// -------------------- Account Registration --------------------
app.post('/account/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!['passenger', 'driver', 'admin'].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }

    try {
        const result = await db.collection('account').insertOne({ name, email, password, role });
        res.status(201).json({ id: result.insertedId });
    } catch {
        res.status(400).json({ error: "Failed to register account" });
    }
});


// -------------------Account Login --------------------
app.post('/account/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.collection('account').findOne({ email, password });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        res.status(200).json({
            id: user._id,
            name: user.name,
            role: user.role
        });
    } catch {
        res.status(500).json({ error: "Login failed" });
    }
});

//----------------------Passenger MANAGEMENT----------------------
//ORDER RIDES
app.post('/passengers/order', async (req, res) => {
    try {
        const result = await db.collection('orders').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch {
        res.status(400).json({ error: "Failed to create order" });
    }
});

//GET/SEES order RIDES
app.get('/passengers/order', async (req, res) => {
    try {
        const orders = await db.collection('orders').find().toArray();
        res.status(200).json(orders);
    } catch {
        res.status(400).json({ error: "Failed to retrieve orders" });
    }
});

//DELETE order RIDES
app.delete('/passengers/order/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('orders').deleteOne({ _id: ObjectId(id) });
        res.status(204).send();
    } catch {
        res.status(400).json({ error: "Failed to delete order" });
    }
});

