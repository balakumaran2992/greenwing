import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import mysql from "mysql2/promise";

const databaseUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log("MYSQL_URL or DATABASE_URL is not set. Skipping database setup.");
  process.exit(0);
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(rootDir, "lib", "seed-data.json");
const seedData = await readFile(seedPath, "utf8");

const connection = await mysql.createConnection(databaseUrl);

try {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INT PRIMARY KEY,
      data JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await connection.execute(`INSERT IGNORE INTO app_state (id, data) VALUES (1, ?)`, [seedData]);

  console.log("MySQL database setup completed.");
} finally {
  await connection.end();
}
