const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = require("./User");

const Transaction = sequelize.define("Transaction", {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  type: {
    type: DataTypes.ENUM(
      "income",
      "expense"
    ),
    allowNull: false
  },

  category: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }

}, {
  timestamps: true
});

// Relationship

User.hasMany(Transaction, {
  foreignKey: "userId",
  onDelete: "CASCADE"
});

Transaction.belongsTo(User, {
  foreignKey: "userId"
});

module.exports = Transaction;