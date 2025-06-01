const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); // Use 'bcrypt' if it works for you
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
