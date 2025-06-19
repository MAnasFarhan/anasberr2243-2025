const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

// Connect to your MongoDB server
const uri = 'mongodb://localhost:27017';

app.get('/analytics/passengers', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('Week7');         // Your database name
    const users = db.collection('Users');  // Case-sensitive collection name

    const result = await users.aggregate([
      {
        $lookup: {
          from: "Rides",               // Case-sensitive name of rides collection
          localField: "_id",
          foreignField: "userId",
          as: "rides"
        }
      },
      { $unwind: "$rides" },
      {
        $group: {
          _id: "$name",
          totalRides: { $sum: 1 },
          totalFare: { $sum: "$rides.fare" },
          avgDistance: { $avg: "$rides.distance" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          totalRides: 1,
          totalFare: 1,
          avgDistance: 1
        }
      }
    ]).toArray();

    res.json(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`✅ API running at http://localhost:${port}/analytics/passengers`);
});