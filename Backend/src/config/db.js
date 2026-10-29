
require("dotenv").config();

const mysql = require("mysql2/promise");

if (!process.env.DB_HOST) {
  console.log("Could not load environment variables from .env file. Please make sure the file exists and is properly configured.");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
});

module.exports = pool;
