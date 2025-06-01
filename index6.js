const bcrypt = require('bcrypt'); 
const saltRounds = 10; 
app.post('/users', async (req, res) => { 
 try { 
 const hashedPassword = await bcrypt.hash(req.body.password, saltRounds); 
 const user = { ...req.body, password: hashedPassword }; 
 await db.collection('users').insertOne(user); 
 res.status(201).json({ message: "User created" }); 
 } catch (err) { 
 res.status(400).json({ error: "Registration failed" }); 
 } 
});