const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {
    // 🚀 Cloud Environment (Render + Supabase Transaction Pooler Fix)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                // 🔥 Strict SSL configuration adjustment for self-signed certificates
                rejectUnauthorized: false 
            }
        },
        pool: {
            max: 3, 
            min: 0,
            acquire: 60000, 
            idle: 10000
        }
    });
} else {
    // 🏠 Local Development Engine
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
        console.log('🐘 PostgreSQL cloud server pipeline connected successfully!');
    } catch (error) {
        console.error('❌ Database connectivity crashed:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };