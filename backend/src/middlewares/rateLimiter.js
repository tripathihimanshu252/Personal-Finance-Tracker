const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const transactionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: { message: 'Transaction limit reached for this hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

const analyticsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: { message: 'Analytics limit reached for this hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, transactionLimiter, analyticsLimiter };