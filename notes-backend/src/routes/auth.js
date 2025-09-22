// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models'); // Sequelize models

const router = express.Router();
const User = db.User;

const JWT_SECRET = "supersecretkey"; // ⚠️ move to .env in production

// ================== Middleware to verify JWT ==================
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ================== REGISTER ==================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "user"
    });

    // ---------- DEBUG LOG ----------
    console.log("Created user:", user.toJSON());
    // -------------------------------

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Error registering user" });
  }
});

// ================== LOGIN ==================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Provide email & password" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Error logging in" });
  }
});

// ================== GET CURRENT USER ==================
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role'] // only send necessary fields
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("Get current user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
