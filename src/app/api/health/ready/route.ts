import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db-monitor";

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const isReady = dbHealth.status !== "unhealthy";

  return NextResponse.json(
    {
      status: isReady ? "ready" : "unready",
      database: dbHealth.status,
      latencyMs: dbHealth.latencyMs,
      timestamp: new Date().toISOString(),
    },
    {
      status: isReady ? 200 : 503,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    }
  );
}
