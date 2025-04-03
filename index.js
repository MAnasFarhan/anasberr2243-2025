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
//const drivers = ["a", "b", "c"];

drivers.forEach((element) => console.log(element.name));


//TODO: add additional driver to the driver array
const count = drivers.push(
    {
        name: "Anas Farhan",
        vehicleType: "SportsCars",
        isAvailable: true,
        rating: 5
    }

);
console.log(count);
// Expected output: 3 (John doe, Alice smith, Anas Farhan)
console.log(drivers);
// Expected output: Array[all list]



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
        const driversCollection = db.collection("drivers");

        drivers.forEach(async (driver) => {
            const result = await driversCollection.insertOne(driver);
            console.log(`New driver created with result: ${result}`);
        });

        const updateResult = await db.collection('drivers').updateMany(
            { name: "John Doe" },
            { $inc: { rating: 0.1 } }
        );
        console.log(`Driver updated with result: ${updateResult}`);

        const availableDrivers = await db.collection('drivers').find({
            isAvailable: true,
            rating: { $gte: 4.5 }
        }).toArray();
        console.log("Available drivers:", availableDrivers);

        const deleteResult = await db.collection('drivers').deleteOne( { isAvailable: false } );
        console.log(`Driver deleted with result: ${deleteResult}`
        );

   } finally {
        await client.close();
    }
}

main();

    /*
        //Insert a document(old code)
        await collection.insertOne({ name: "Anas", age: 23 });
        console.log("Document inserted!");
        
        //Query the document
        const result = await collection.findOne({ name: "Anas" });
        console.log("Query result:", result);
    }   catch (err) {
        console.error("Error:", err); 
        
    */
