const { MongoClient } = require('mongodb');

// Replace with your actual MongoDB URI
const uri = 'mongodb://localhost:27017';

// Replace with your database name
const dbName = 'mytaxi';

async function connectToMongoDB() {
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(dbName);

        // Example: get all customers
        const customers = await db.collection('customers').find().toArray();
        console.log(customers);

    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
    } finally {
        await client.close();
        console.log('🔒 Connection closed');
    }
}

// Run the function
connectToMongoDB();
