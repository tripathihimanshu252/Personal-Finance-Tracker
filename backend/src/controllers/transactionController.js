const Transaction = require('../models/Transaction');

// 🚀 Rasta sahi kiya: Do folder peeche jaakar server.js milega
const serverModule = require('../../server');

// 🔥 FIXED CACHE CLEAR HELPER: Ab yeh specific userId ki key delete karega
const clearAnalyticsCache = async (userId) => {
    try {
        // Server.js se redisClient nikalna
        const redisClient = serverModule.redisClient || serverModule; 
        
        if (redisClient && (redisClient.isOpen || redisClient.connected)) {
            // 🔥 EXACT MATCH KEY: Jo analyticsController me 'analytics:${userId}' bani hai, wahi yahan delete hogi!
            const cacheKey = `analytics:${userId}`;
            await redisClient.del(cacheKey); 
            console.log(`🔄 Redis Cache cleared automatically for user id: ${userId}`);
        }
    } catch (err) {
        console.error('Redis cache clear failed:', err.message);
    }
};

const createTransaction = async (req, res) => {
    try {
        const { amount, type, category, description, date } = req.body;
        
        const transaction = await Transaction.create({
            amount,
            type,
            category,
            description,
            date,
            userId: req.user.id
        });

        // 🚀 AUTOMATIC CACHE CLEAR! (User ID pass kar di)
        await clearAnalyticsCache(req.user.id);

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (req.user.role !== 'admin') {
            whereClause.userId = req.user.id;
        }

        const { count, rows } = await Transaction.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            transactions: rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, category, description, date } = req.body;

        const transaction = await Transaction.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (req.user.role !== 'admin' && transaction.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await transaction.update({ amount, type, category, description, date });

        // 🚀 AUTOMATIC CACHE CLEAR! (User ID pass kar di)
        await clearAnalyticsCache(req.user.id);

        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (req.user.role !== 'admin' && transaction.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await transaction.destroy();

        // 🚀 AUTOMATIC CACHE CLEAR! (User ID pass kar di)
        await clearAnalyticsCache(req.user.id);

        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction
};