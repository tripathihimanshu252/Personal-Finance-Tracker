const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

let sequelize;

// 🚀 Agar cloud par DATABASE_URL mili (Render/Supabase), toh seedhe usse connect karo
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Production cloud connections (Supabase) ke liye zaroori hai
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
    // 🏠 Agar local computer hai, toh tumhara purana config automatic chalega
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
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
        console.log('🐘 PostgreSQL connected successfully');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };