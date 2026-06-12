const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../Models/User");
const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate input
    if (!name || !phone || !password) {
      return res.status(400).json({ message: "Name, phone, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this phone number" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "customer",
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validate input
    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: "Invalid phone or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid phone or password" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        creditBalance: user.creditBalance,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
