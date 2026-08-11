import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("DATABASE_URL is required to run migrations.");
const directory = path.join(process.cwd(), "database", "migrations");
const files = (await fs.readdir(directory)).filter((name) => /^\d{4}_[a-z0-9_-]+\.sql$/.test(name)).sort();
const client = new pg.Client({ connectionString: databaseUrl, ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined });
await client.connect();
try {
  await client.query("select pg_advisory_lock($1)", [8102026]);
  await client.query("create table if not exists schema_migration (name text primary key, applied_at timestamptz not null default now())");
  const applied = new Set((await client.query("select name from schema_migration")).rows.map((row) => row.name));
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await fs.readFile(path.join(directory, file), "utf8");
    await client.query("begin");
    try { await client.query(sql); await client.query("insert into schema_migration(name) values($1)", [file]); await client.query("commit"); console.log(`Applied ${file}`); }
    catch (error) { await client.query("rollback"); throw error; }
  }
  console.log(files.length ? "Database migrations are current." : "No database migrations found.");
} finally {
  await client.query("select pg_advisory_unlock($1)", [8102026]).catch(() => undefined);
  await client.end();
}
