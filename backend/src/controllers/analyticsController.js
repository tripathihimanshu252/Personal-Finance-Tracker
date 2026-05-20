const { Sequelize } = require('sequelize');
const Transaction = require('../models/Transaction');
const redis = require('redis');

// 🧼 String cleaning logic agar controller ke andar direct call ho jaye
let rawRedisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
if (rawRedisUrl.includes('redis-cli --tls -u ')) {
    rawRedisUrl = rawRedisUrl.replace('redis-cli --tls -u ', '').trim();
}

// 🚀 Cleaned Cloud URL se client initialize karo (Line 6 Error Strict Fix)
const redisClient = redis.createClient({ 
    url: rawRedisUrl 
});

redisClient.on('error', (err) => console.error('❌ Analytics Redis Error:', err));

// Self-invoking connection logic to prevent blocking
(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('⚡ Redis Connected to Analytics Controller');
        }
    } catch (err) {
        console.error('❌ Redis Connection Failed in Analytics:', err.message);
    }
})();

const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const cacheKey = `analytics:${userId}`;

        // 🧠 Check Cache
        if (redisClient.isOpen) {
            try {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    return res.status(200).json({ source: 'cache', data: JSON.parse(cachedData) });
                }
            } catch (cacheErr) {
                console.error('⚠️ Redis Get Error (Falling back to DB):', cacheErr.message);
            }
        }

        const whereClause = { userId };

        const categoryData = await Transaction.findAll({
            where: whereClause,
            attributes: [
                'category',
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']
            ],
            group: ['category']
        });

        const monthlyData = await Transaction.findAll({
            where: whereClause,
            attributes: [
                'type',
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']
            ],
            group: ['type']
        });

        const analyticsResult = { categoryData, monthlyData };

        // 💾 Set Cache for 15 minutes (900 seconds)
        if (redisClient.isOpen) {
            try {
                await redisClient.setEx(cacheKey, 900, JSON.stringify(analyticsResult));
            } catch (cacheErr) {
                console.error('⚠️ Redis SetEx Error:', cacheErr.message);
            }
        }

        res.status(200).json({ source: 'database', data: analyticsResult });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAnalytics };