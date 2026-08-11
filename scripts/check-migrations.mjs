import fs from "node:fs/promises";
import path from "node:path";

const directory = path.join(process.cwd(), "database", "migrations");
const files = (await fs.readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
if (!files.length) throw new Error("No SQL migrations found.");
const seen = new Set();
for (const file of files) {
  if (!/^\d{4}_[a-z0-9_-]+\.sql$/.test(file)) throw new Error(`Invalid migration filename: ${file}`);
  const prefix = file.slice(0,4); if (seen.has(prefix)) throw new Error(`Duplicate migration number: ${prefix}`); seen.add(prefix);
  const sql = await fs.readFile(path.join(directory,file),"utf8");
  if (!/(?:CREATE|ALTER)\s+TABLE/i.test(sql)) throw new Error(`Migration contains no table definition or alteration: ${file}`);
}
console.log(`Validated ${files.length} database migration${files.length === 1 ? "" : "s"}.`);
