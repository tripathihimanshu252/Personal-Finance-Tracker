const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// Generate JWT Token

const generateToken = (id) => {

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

// Register User

const registerUser = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role
    } = req.body;

    // Validation

    if (!name || !email || !password) {

      return res.status(400).json({
        message: "All fields are required"
      });

    }

    // Check Existing User

    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {

      return res.status(400).json({
        message: "User already exists"
      });

    }

    // Hash Password

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // Create User

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    res.status(201).json({

      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,

      token: generateToken(user.id)

    });

  } catch (error) {

    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });

  }
};

// Login User

const loginUser = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    // Check User

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {

      return res.status(401).json({
        message: "Invalid credentials"
      });

    }

    // Compare Password

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {

      return res.status(401).json({
        message: "Invalid credentials"
      });

    }

    res.status(200).json({

      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,

      token: generateToken(user.id)

    });

  } catch (error) {

    res.status(500).json({
      message: "Login failed",
      error: error.message
    });

  }
};

// Get Current User

const getCurrentUser = async (req, res) => {

  try {

    res.status(200).json(req.user);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch user"
    });

  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};