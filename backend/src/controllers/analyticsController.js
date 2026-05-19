const { Sequelize } = require('sequelize');
const Transaction = require('../models/Transaction');
const redis = require('redis');

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Error', err));

(async () => {
    try {
        if (!redisClient.isOpen) await redisClient.connect();
    } catch (err) {
        console.error('Redis Connection Failed:', err.message);
    }
})();

const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const cacheKey = `analytics:${userId}`;

        if (redisClient.isOpen) {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                return res.status(200).json({ source: 'cache', data: JSON.parse(cachedData) });
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

        if (redisClient.isOpen) {
            await redisClient.setEx(cacheKey, 900, JSON.stringify(analyticsResult));
        }

        res.status(200).json({ source: 'database', data: analyticsResult });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAnalytics };