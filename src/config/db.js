const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("Connected to SQL Server");
    return pool;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

module.exports = { connectDB, sql };
