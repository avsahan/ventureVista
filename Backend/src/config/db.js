
const path = require("node:path");
const envPath = path.resolve(__dirname, "../../.env");
require("dotenv").config({ path: envPath });

const mysql = require("mysql2/promise");

const missingVariables = ["DB_USER", "DB_NAME"].filter(
  (variable) => !process.env[variable]?.trim()
);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required database environment variables: ${missingVariables.join(", ")}. ` +
    `Create ${envPath} from .env.example and set your MySQL credentials.`
  );
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
