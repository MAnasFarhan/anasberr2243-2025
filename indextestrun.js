const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');                       

const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');    

require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let db; 

async function start() {
    try {   
        await client.connect();
        db = client.db('e_hailing');
        console.log("Connected to MongoDB");
        app.listen(3000, () => console.log("Server running on http://localhost:3000"));
    }
    catch (err) {
        console.error(err); 
    }
}

start();



// -------------------- Auth Middleware --------------------
function auth(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: "Missing token" });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(403).json({ error: "Invalid token" });
    }
}

// -------------------- User Registration --------------------
app.post('/users/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!['passenger', 'driver', 'admin'].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.collection('users').insertOne({ name, email, password: hashedPassword, role });
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ error: "Registration failed" });
    }
});

// -------------------- User Login --------------------
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            message: "Login successful",
            token,
            role: user.role,
            name: user.name
        });
    } catch {
        res.status(500).json({ error: "Login error" });
    }
});

// -------------------- Protected Route Example --------------------
app.get('/dashboard', auth, (req, res) => {
    res.json({ message: `Welcome ${req.user.role} with ID ${req.user.id}` });
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


