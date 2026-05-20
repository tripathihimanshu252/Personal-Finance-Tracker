const { Op } = require("sequelize");

const Transaction = require("../models/Transaction");

// Create Transaction

const createTransaction = async (req, res) => {

  try {

    const {
      title,
      amount,
      type,
      category,
      description,
      date
    } = req.body;

    // Validation

    if (
      !title ||
      !amount ||
      !type ||
      !category ||
      !date
    ) {

      return res.status(400).json({
        message: "Required fields missing"
      });

    }

    // Create Transaction

    const transaction = await Transaction.create({

      title,
      amount,
      type,
      category,
      description,
      date,

      userId: req.user.id

    });

    res.status(201).json(transaction);

  } catch (error) {

    res.status(500).json({
      message: "Failed to create transaction",
      error: error.message
    });

  }
};

// Get Transactions

const getTransactions = async (req, res) => {

  try {

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const search = req.query.search || "";

    const category = req.query.category || "";

    const type = req.query.type || "";

    const whereClause = {};

    // RBAC Data Access

    if (req.user.role !== "admin") {
      whereClause.userId = req.user.id;
    }

    // Search Filter

    if (search) {

      whereClause[Op.or] = [

        {
          title: {
            [Op.iLike]: `%${search}%`
          }
        },

        {
          category: {
            [Op.iLike]: `%${search}%`
          }
        }

      ];
    }

    // Category Filter

    if (category) {
      whereClause.category = category;
    }

    // Type Filter

    if (type) {
      whereClause.type = type;
    }

    // Fetch Transactions

    const transactions = await Transaction.findAndCountAll({

      where: whereClause,

      limit,
      offset,

      order: [["date", "DESC"]]

    });

    res.status(200).json({

      total: transactions.count,

      currentPage: page,

      totalPages: Math.ceil(
        transactions.count / limit
      ),

      transactions: transactions.rows

    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch transactions",
      error: error.message
    });

  }
};

// Update Transaction

const updateTransaction = async (req, res) => {

  try {

    const transaction = await Transaction.findByPk(
      req.params.id
    );

    if (!transaction) {

      return res.status(404).json({
        message: "Transaction not found"
      });

    }

    // Ownership Check

    if (
      req.user.role !== "admin" &&
      transaction.userId !== req.user.id
    ) {

      return res.status(403).json({
        message: "Access denied"
      });

    }

    await transaction.update(req.body);

    res.status(200).json(transaction);

  } catch (error) {

    res.status(500).json({
      message: "Failed to update transaction",
      error: error.message
    });

  }
};

// Delete Transaction

const deleteTransaction = async (req, res) => {

  try {

    const transaction = await Transaction.findByPk(
      req.params.id
    );

    if (!transaction) {

      return res.status(404).json({
        message: "Transaction not found"
      });

    }

    // Ownership Check

    if (
      req.user.role !== "admin" &&
      transaction.userId !== req.user.id
    ) {

      return res.status(403).json({
        message: "Access denied"
      });

    }

    await transaction.destroy();

    res.status(200).json({
      message: "Transaction deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to delete transaction",
      error: error.message
    });

  }
};

module.exports = {

  createTransaction,

  getTransactions,

  updateTransaction,

  deleteTransaction

};