const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

dotenv.config();

const { connectDB, sequelize } = require("./src/config/db");

// Routes
const authRoutes = require("./src/routes/authRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");

const app = express();

app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

app.use(express.json({
  limit: "10kb"
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Health route
app.get("/", (req, res) => {
  res.json({
    message: "Finance Tracker API Running"
  });
});

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many auth requests. Try again later."
  }
});

const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: {
    message: "Transaction limit exceeded."
  }
});

const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    message: "Analytics limit exceeded."
  }
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);

app.use(
  "/api/transactions",
  transactionLimiter,
  transactionRoutes
);

app.use(
  "/api/analytics",
  analyticsLimiter,
  analyticsRoutes
);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();

    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
};

startServer();