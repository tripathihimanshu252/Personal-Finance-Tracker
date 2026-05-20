const { Sequelize } = require("sequelize");

const Transaction = require("../models/Transaction");

// Optional Redis Setup

let redisClient = null;

try {

  const redis = require("redis");

  if (process.env.REDIS_URL) {

    redisClient = redis.createClient({
      url: process.env.REDIS_URL
    });

    redisClient.connect()
      .then(() => {
        console.log("Redis Connected");
      })
      .catch((err) => {
        console.log("Redis Disabled:", err.message);
      });

  }

} catch (error) {

  console.log("Redis Not Available");

}

// Get Analytics

const getAnalytics = async (req, res) => {

  try {

    const cacheKey = `analytics_${req.user.id}`;

    // Check Cache

    if (redisClient && redisClient.isOpen) {

      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {

        return res.status(200).json({
          source: "cache",
          data: JSON.parse(cachedData)
        });

      }
    }

    // Role-Based Access

    const whereClause = {};

    if (req.user.role !== "admin") {
      whereClause.userId = req.user.id;
    }

    // Category Breakdown

    const categoryData = await Transaction.findAll({

      where: whereClause,

      attributes: [

        "category",

        [
          Sequelize.fn(
            "SUM",
            Sequelize.col("amount")
          ),
          "total"
        ]

      ],

      group: ["category"]

    });

    // Income vs Expense

    const incomeExpenseData = await Transaction.findAll({

      where: whereClause,

      attributes: [

        "type",

        [
          Sequelize.fn(
            "SUM",
            Sequelize.col("amount")
          ),
          "total"
        ]

      ],

      group: ["type"]

    });

    // Monthly Trends

    const monthlyData = await Transaction.findAll({

      where: whereClause,

      attributes: [

        [
          Sequelize.fn(
            "TO_CHAR",
            Sequelize.col("date"),
            "YYYY-MM"
          ),
          "month"
        ],

        [
          Sequelize.fn(
            "SUM",
            Sequelize.col("amount")
          ),
          "total"
        ]

      ],

      group: ["month"],

      order: [
        [
          Sequelize.literal("month"),
          "ASC"
        ]
      ]

    });

    const analytics = {

      categoryData,

      incomeExpenseData,

      monthlyData

    };

    // Cache for 15 Minutes

    if (redisClient && redisClient.isOpen) {

      await redisClient.setEx(
        cacheKey,
        900,
        JSON.stringify(analytics)
      );

    }

    res.status(200).json({
      source: "database",
      data: analytics
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message
    });

  }
};

module.exports = {
  getAnalytics
};