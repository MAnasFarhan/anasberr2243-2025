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

//DELETE PASSENGER ACCOUNT
app.delete('/passengers/account/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('account').deleteOne({ _id: ObjectId(id) });
        res.status(204).send();
    } catch {
        res.status(400).json({ error: "Failed to delete account" });
    }
});

//passenger Viewing drivers information
app.get('/drivers', async (req, res) => {
    try {
        const drivers = await db.collection('account').find({ role: 'driver' }).toArray();
        res.status(200).json(drivers);
    } catch {
        res.status(400).json({ error: "Failed to retrieve drivers" });
    }
});


// -------------------Driver MANAGEMENT----------------------
//DRIVER accept order from passenger
app.post('/drivers/accept', async (req, res) => {
    const { driverId, orderId } = req.body;
    try {
        const result = await db.collection('orders').updateOne(
            { _id: ObjectId(orderId) },
            { $set: { status: 'accepted', driverId: ObjectId(driverId) } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Order not found or already accepted" });
        }
        res.status(200).json({ message: "Order accepted successfully" });
    } catch {
        res.status(400).json({ error: "Failed to accept order" });
    }
});

//view passenger orders
app.get('/drivers/orders', async (req, res) => {
    try {
        const orders = await db.collection('orders').find({ status: 'accepted' }).toArray();
        res.status(200).json(orders);
    } catch {
        res.status(400).json({ error: "Failed to retrieve orders" });
    }
});

// driver can update own profile
app.put('/drivers/profile/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        const result = await db.collection('account').updateOne(
            { _id: ObjectId(id) },
            { $set: { name, email } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Driver not found" });
        }
        res.status(200).json({ message: "Profile updated successfully" });
    } catch {
        res.status(400).json({ error: "Failed to update profile" });
    }
}); 

//driver delete account
app.delete('/drivers/account/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('account').deleteOne({ _id: ObjectId(id) });
        res.status(204).send();
    } catch {
        res.status(400).json({ error: "Failed to delete account" });
    }
}); 

