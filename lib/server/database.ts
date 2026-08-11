import "server-only";
import { Pool } from "pg";

declare global { var kirpinovaDatabasePool: Pool | undefined; }

function databaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) throw new Error("DATABASE_URL is not configured.");
  return value;
}

export function getDatabasePool() {
  if (!globalThis.kirpinovaDatabasePool) {
    globalThis.kirpinovaDatabasePool = new Pool({
      connectionString: databaseUrl(),
      max: Number(process.env.DATABASE_POOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined,
    });
    globalThis.kirpinovaDatabasePool.on("error", (error) => console.error("PostgreSQL pool error", { name: error.name, message: error.message }));
  }
  return globalThis.kirpinovaDatabasePool;
}

export async function checkDatabase() {
  const startedAt = performance.now();
  const result = await getDatabasePool().query<{ current_database: string }>("select current_database() as current_database");
  return { database: result.rows[0]?.current_database || "unknown", latencyMs: Math.round(performance.now() - startedAt) };
}
