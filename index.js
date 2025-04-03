const { MongoClient } = require('mongodb');

const drivers = [
    {
        name: "John Doe",
        vehicleType: "Sedan",
        isAvailable: true,
        rating: 4.8
    },
    {
        name: "Alice Smith",
        vehicleType: "SUV",
        isAvailable: false,
        rating: 4.5
    }
];
//show the data in the console
console.log(drivers);

//TODO: show the all the drivers name in the console

//TODO: add additional driver to the driver array
async function main(){
    //Replace <connection-string> with your MongoDB URI
    const uri = "mongodb://localhost:27017"
    const client = new MongoClient(uri);

    console.time("Connection Time");

    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        console.timeEnd("Connection Time");
        
        const db = client.db("testDB");
        const collection = db.collection("users");

        //Insert a document
        await collection.insertOne({ name: "Anas", age: 23 });
        console.log("Document inserted!");
        
        //Query the document
        const result = await collection.findOne({ name: "Anas" });
        console.log("Query result:", result);
    }   catch (err) {
        console.error("Error:", err);
    }   finally {
        await client.close();
    }
}

main();