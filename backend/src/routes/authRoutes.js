const express = require("express");

const {
  registerUser,
  loginUser,
  getCurrentUser
} = require("../controllers/authController");

const {
  protect
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Current Logged In User
router.get("/me", protect, getCurrentUser);

module.exports = router;