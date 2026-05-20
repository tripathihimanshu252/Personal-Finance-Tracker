const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {

  // Production Database (Render/Supabase)

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

} else {

  // Local Database

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres",
      logging: false,

      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

const connectDB = async () => {
  try {

    await sequelize.authenticate();

    console.log("PostgreSQL Connected Successfully");

  } catch (error) {

    console.error("Database Connection Failed:", error.message);

    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB
};