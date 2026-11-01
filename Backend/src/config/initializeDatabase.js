const fs = require("node:fs/promises");
const path = require("node:path");
const db = require("./db");

async function initializeDatabase() {
  const schemaPath = path.resolve(__dirname, "../../sql/schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  if (statements.length === 0) {
    throw new Error(`Database schema is empty: ${schemaPath}`);
  }

  const connection = await db.getConnection();
  try {
    for (const statement of statements) {
      await connection.query(statement);
    }
  } finally {
    connection.release();
  }
}

module.exports = initializeDatabase;
