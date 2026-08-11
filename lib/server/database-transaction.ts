import "server-only";
import type { PoolClient } from "pg";
import { getDatabasePool } from "@/lib/server/database";

export async function withDatabaseTransaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await getDatabasePool().connect();
  try {
    await client.query("begin");
    const value = await work(client);
    await client.query("commit");
    return value;
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
