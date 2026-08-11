import { checkDatabase } from "@/lib/server/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const database = await checkDatabase();
    return Response.json({ status: "ready", service: "kirpinova-web", database, time: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ status: "not_ready", service: "kirpinova-web", database: { connected: false }, message: error instanceof Error ? error.message : "Database check failed." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
