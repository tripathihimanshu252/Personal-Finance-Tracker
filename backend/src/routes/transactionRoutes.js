const express = require("express");

const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} = require("../controllers/transactionController");

const {
  protect,
  authorizeRoles
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Get All Transactions
// Accessible to all roles

router.get(
  "/",
  protect,
  getTransactions
);

// Create Transaction
// Only admin & user

router.post(
  "/",
  protect,
  authorizeRoles("admin", "user"),
  createTransaction
);

// Update Transaction
// Only admin & user

router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "user"),
  updateTransaction
);

// Delete Transaction
// Only admin & user

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "user"),
  deleteTransaction
);

module.exports = router;