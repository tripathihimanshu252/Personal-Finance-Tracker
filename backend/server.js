const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const redis = require('redis'); // 🚀 1. Redis library import ki
require('dotenv').config();
const { sequelize } = require('./src/config/db');

// Routes imports
const authRoutes = require('./src/routes/authRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const app = express();

// 🚀 2. Redis Client Initialize aur Connect karna
// 🚀 2. Redis Client Initialize (Environment Variable Support ke sath)
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.on('connect', () => console.log('🔴 Redis Server Connected Successfully!'));
redisClient.on('error', (err) => console.error('❌ Redis Connection Error:', err.message));

// Redis connection trigger karna (IIFE)
(async () => {
    await redisClient.connect();
})();

// 1. Security Middlewares (XSS aur SQL injection base layers protection)
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // Prevents large payload body attacks

app.use(cors({ 
    origin: "https://your-frontend-vercel-url.vercel.app", // Aapka vercel link
  credentials: true
}));

// 2. HR Requirement: Rate Limiting for different endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 61 * 1000, // 15 minutes
    max: 5,
    message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

const transactionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    message: { message: 'Transaction API limit reached for this hour' }
});

const analyticsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50,
    message: { message: 'Analytics view limit reached for this hour' }
});

// Apply precise limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/transactions', transactionLimiter, transactionRoutes);
app.use('/api/analytics', analyticsLimiter, analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

sequelize.sync()
    .then(() => {
        console.log('Tables synchronized successfully');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection failed:', err.message);
    });

// 🚀 3. redisClient ko export kar rahe hain taaki controller automatic ise use kar sakein
module.exports = { app, redisClient };