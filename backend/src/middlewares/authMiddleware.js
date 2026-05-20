const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {

  try {

    let token;

    // Check Authorization Header

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token = req.headers.authorization.split(" ")[1];

    }

    // No Token

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, token missing"
      });
    }

    // Verify Token

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find User

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] }
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    req.user = user;

    next();

  } catch (error) {

    return res.status(401).json({
      message: "Invalid or expired token"
    });

  }
};

// Role Based Access Control

const authorizeRoles = (...roles) => {

  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {

      return res.status(403).json({
        message: "Access denied"
      });

    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles
};