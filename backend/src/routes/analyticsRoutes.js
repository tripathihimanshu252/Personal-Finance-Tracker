const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const { analyticsLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.get('/', protect, analyticsLimiter, getAnalytics);

module.exports = router;