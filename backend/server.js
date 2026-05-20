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

// 🧼 Redis URL Cleaning Logic (Agar Render dashboard/env me terminal command inject ho jaye)
let mainRedisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
if (mainRedisUrl.includes('redis-cli --tls -u ')) {
    mainRedisUrl = mainRedisUrl.replace('redis-cli --tls -u ', '').trim();
}

// 🚀 2. Redis Client Initialize (Cleaned Cloud URL & Smart Reconnect limits ke sath)
const redisClient = redis.createClient({
  url: mainRedisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        console.log('⚠️ Redis Main: Maximum reconnect retries reached. Stopping socket loop.');
        return false; // Upstash constant connection drop loops ko roknis ke liye
      }
      return Math.min(retries * 1000, 3000); // Retries ke beech delay badhaega
    }
  }
});

redisClient.on('connect', () => console.log('🔴 Redis Server Connected Successfully!'));
redisClient.on('error', (err) => console.error('❌ Redis Connection Error:', err.message));

// Redis connection trigger karna (IIFE)
(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.error('❌ Redis Connection Trigger Failed:', err.message);
    }
})();

// 1. Security Middlewares (XSS aur SQL injection base layers protection)
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // Prevents large payload body attacks

app.use(cors({ 
    origin: "https://your-frontend-vercel-url.vercel.app", // Aapka vercel link badal lena baad me
    credentials: true
}));

// 2. Rate Limiting Configurations
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

// 🚀 3. redisClient ko export kar rahe hain taaki baki controllers ise reuse kar sakein
module.exports = { app, redisClient };