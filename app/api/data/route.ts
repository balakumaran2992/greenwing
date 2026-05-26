import { NextResponse } from "next/server";
import mysql, { type Pool } from "mysql2/promise";
import { cloneSeedData } from "../../../lib/seed";
import type { AppData } from "../../../lib/types";

let memoryData = cloneSeedData();
let pool: Pool | null = null;

const databaseUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

function getPool() {
  if (!databaseUrl) {
    return null;
  }

  if (!pool) {
    pool = mysql.createPool({
      uri: databaseUrl,
      connectionLimit: 5,
      waitForConnections: true
    });
  }

  return pool;
}

function normalizeStoredData(value: unknown): AppData {
  if (!value) {
    return cloneSeedData();
  }

  if (typeof value === "string") {
    return JSON.parse(value) as AppData;
  }

  if (Buffer.isBuffer(value)) {
    return JSON.parse(value.toString("utf8")) as AppData;
  }

  return value as AppData;
}

async function ensureAppState(db: Pool) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INT PRIMARY KEY,
      data JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`INSERT IGNORE INTO app_state (id, data) VALUES (1, ?)`, [
    JSON.stringify(cloneSeedData())
  ]);
}

export async function GET() {
  const db = getPool();

  if (!db) {
    return NextResponse.json(memoryData);
  }

  try {
    await ensureAppState(db);
    const [rows] = await db.query("SELECT data FROM app_state WHERE id = 1 LIMIT 1");
    const row = Array.isArray(rows) ? (rows[0] as { data?: unknown } | undefined) : undefined;
    const data = normalizeStoredData(row?.data);
    memoryData = data;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to read MySQL app data", error);
    return NextResponse.json(memoryData);
  }
}

export async function PUT(request: Request) {
  const nextData = (await request.json()) as AppData;
  memoryData = nextData;

  const db = getPool();

  if (!db) {
    return NextResponse.json(memoryData);
  }

  try {
    await ensureAppState(db);
    await db.execute(
      `
      INSERT INTO app_state (id, data)
      VALUES (1, ?)
      ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP
      `,
      [JSON.stringify(nextData)]
    );
  } catch (error) {
    console.error("Failed to save MySQL app data", error);
  }

  return NextResponse.json(memoryData);
}
