const express = require('express');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt'); // Use 'bcrypt' if it works for you

require('dotenv').config();

const { MongoClient, ObjectId } = require('mongodb');
const app = express();
app.use(express.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let db;

// Connect to MongoDB
client.connect().then(() => {
  db = client.db('e_hailing');
  console.log('Connected to MongoDB');
});

const saltRounds = 10;

app.post('/users', async (req, res) => {
  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create a new user object with the hashed password
    const user = {
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role
    };

    // Save user to MongoDB (or your DB)
    await db.collection('users').insertOne(user);

    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: "Registration failed" });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});



app.post('/auth/login', async (req, res) => { 
 const user = await db.collection('users').findOne({ email: req.body.email
}); 
 if (!user || !(await bcrypt.compare(req.body.password, user.password))) { 
 return res.status(401).json({ error: "Invalid credentials" }); 
 } 
 const token = jwt.sign( 
 { userId: user._id, role: user.role }, 
 process.env.JWT_SECRET, 
 { expiresIn: process.env.JWT_EXPIRES_IN } 
 ); 
 res.status(200).json({ token }); // Return token to client 
}); 


const authenticate = (req, res, next) => { 
 const token = req.headers.authorization?.split(' ')[1];
 if (!token) return res.status(401).json({ error: "Unauthorized" }); 
 try { 
 const decoded = jwt.verify(token, process.env.JWT_SECRET); 
 req.user = decoded;
 next(); 
 } catch (err) { 
 res.status(401).json({ error: "Invalid token" }); 
 } 
}; 
const authorize = (roles) => (req, res, next) => { 
 if (!roles.includes(req.user.role))
 return res.status(403).json({ error: "Forbidden" }); 
 next(); 
};

app.delete('/admin/users/:id', authenticate, authorize(['admin']), async (req,
res) => { 
 console.log("admin only");
 res.status(200).send("admin access");
});

// GET /admin/users - Fetch all user accounts
app.get('/admin/users', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const users = await db.collection('users').find().toArray();
        if (users.length === 0) {
            return res.status(403).json({ error: "No user accounts found" });
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user accounts" });
    }
});