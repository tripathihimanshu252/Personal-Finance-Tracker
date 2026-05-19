const express = require('express');
const { createTransaction, getTransactions, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { transactionLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.use(protect);

router.get('/', transactionLimiter, getTransactions);
router.post('/', transactionLimiter, authorize('admin', 'user'), createTransaction);
router.put('/:id', transactionLimiter, authorize('admin', 'user'), updateTransaction);
router.delete('/:id', transactionLimiter, authorize('admin', 'user'), deleteTransaction);

module.exports = router;