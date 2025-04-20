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
        db = client.db('marketplace');
        console.log("Connected to MongoDB");
        app.listen(3000, () => console.log("Server running on http://localhost:3000"));
    } catch (err) {
        console.error(err);
    }
}
start();

// -------------------- Customer Routes --------------------
app.post('/customers/register', async (req, res) => {
    try {
        const result = await db.collection('customers').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch {
        res.status(400).json({ error: "Failed to register customer" });
    }
});

app.post('/customers/login', async (req, res) => {
    try {
        const user = await db.collection('customers').findOne({
            email: req.body.email,
            password: req.body.password
        });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });
        res.status(200).json(user);
    } catch {
        res.status(500).json({ error: "Login failed" });
    }
});

app.get('/items', async (req, res) => {
    try {
        const items = await db.collection('items').find().toArray();
        res.status(200).json(items);
    } catch {
        res.status(500).json({ error: "Failed to fetch items" });
    }
});

app.post('/orders', async (req, res) => {
    try {
        const result = await db.collection('orders').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch {
        res.status(400).json({ error: "Failed to create order" });
    }
});

app.post('/reports', async (req, res) => {
    try {
        const result = await db.collection('reports').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch {
        res.status(400).json({ error: "Failed to create report" });
    }
});

// -------------------- Seller Routes --------------------
app.post('/sellers/register', async (req, res) => {
    try {
        const result = await db.collection('sellers').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch {
        res.status(400).json({ error: "Failed to register seller" });
    }
});

app.post('/sellers/login', async (req, res) => {
    try {
        const seller = await db.collection('sellers').findOne({
            email: req.body.email,
            password: req.body.password
        });
        if (!seller) return res.status(401).json({ error: "Invalid credentials" });
        res.status(200).json(seller);
    } catch {
        res.status(500).json({ error: "Login failed" });
    }
});

app.post('/items', async (req, res) => {
    try {
        const result = await db.collection('items').insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch {
        res.status(400).json({ error: "Failed to add item" });
    }
});

app.delete('/items/:id', async (req, res) => {
    try {
        const result = await db.collection('items').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Item not found" });
        res.status(200).json({ deleted: result.deletedCount });
    } catch {
        res.status(400).json({ error: "Invalid item ID" });
    }
});

app.get('/orders/seller/:sellerId', async (req, res) => {
    try {
        const orders = await db.collection('orders').find({ sellerId: req.params.sellerId }).toArray();
        res.status(200).json(orders);
    } catch {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// -------------------- Admin Routes --------------------
app.get('/admin/accounts', async (req, res) => {
    try {
        const customers = await db.collection('customers').find().toArray();
        const sellers = await db.collection('sellers').find().toArray();
        res.status(200).json({ customers, sellers });
    } catch {
        res.status(500).json({ error: "Failed to fetch accounts" });
    }
});

app.delete('/admin/accounts/:type/:id', async (req, res) => {
    const collection = req.params.type === 'customer' ? 'customers' : 'sellers';
    try {
        const result = await db.collection(collection).deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Account not found" });
        res.status(200).json({ deleted: result.deletedCount });
    } catch {
        res.status(400).json({ error: "Invalid account ID" });
    }
});

app.get('/admin/reports', async (req, res) => {
    try {
        const reports = await db.collection('reports').find().toArray();
        res.status(200).json(reports);
    } catch {
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});
