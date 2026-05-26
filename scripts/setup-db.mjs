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
const schemaPath = path.join(rootDir, "db", "mysql-schema.sql");
const seedPath = path.join(rootDir, "lib", "seed-data.json");
const schemaSql = await readFile(schemaPath, "utf8");
const seedData = await readFile(seedPath, "utf8");

const connection = await mysql.createConnection(databaseUrl);

try {
  const statements = schemaSql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await connection.execute(statement);
  }

  await connection.execute(`INSERT IGNORE INTO app_state (id, data) VALUES (1, ?)`, [seedData]);
  await connection.execute(
    `
    INSERT IGNORE INTO users (username, password_hash, role)
    VALUES ('admin', 'admin123', 'admin')
    `
  );
  await connection.execute(
    `
    INSERT IGNORE INTO app_users (name, username, password, role, permissions)
    VALUES ('Main Admin', 'admin', 'admin123', 'admin', JSON_ARRAY(
      'Dashboard',
      'Daily Sale',
      'Monthly Sale Report',
      'Supplier Invoice',
      'GST Bills',
      'GST Details',
      'Expenses',
      'Employees',
      'Attendance',
      'Payroll',
      'Stock Management',
      'Overall Stock Inventory',
      'User Authorization',
      'Activity Logs'
    ))
    `
  );

  console.log(`MySQL database setup completed. ${statements.length} schema statements checked.`);
} finally {
  await connection.end();
}
