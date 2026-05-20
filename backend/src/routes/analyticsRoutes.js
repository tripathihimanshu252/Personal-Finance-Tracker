const express = require("express");

const {
  getAnalytics
} = require("../controllers/analyticsController");

const {
  protect
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Analytics Route
// Accessible to all authenticated roles

router.get(
  "/",
  protect,
  getAnalytics
);

module.exports = router;