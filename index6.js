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
