import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db-monitor";
import { metrics } from "@/lib/metrics";

export async function GET() {
  const [dbHealth, summary] = await Promise.all([
    checkDatabaseHealth(),
    metrics.getSummary(),
  ]);

  const isHealthy = dbHealth.status === "healthy" || dbHealth.status === "degraded";
  const overallStatus =
    dbHealth.status === "unhealthy"
      ? "unhealthy"
      : dbHealth.status === "degraded" || summary.recentErrorRatePercent > 5
      ? "degraded"
      : "healthy";

  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.1.0",
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds: summary.uptimeSeconds,
      components: {
        database: {
          status: dbHealth.status,
          latencyMs: dbHealth.latencyMs,
          message: dbHealth.message,
        },
        memory: {
          status: summary.memory.heapUsedMb > 1024 ? "warning" : "healthy",
          heapUsedMb: summary.memory.heapUsedMb,
          heapTotalMb: summary.memory.heapTotalMb,
          rssMb: summary.memory.rssMb,
        },
        performance: {
          totalRequests: summary.totalRequests,
          recentErrorRatePercent: summary.recentErrorRatePercent,
          latencyAvgMs: summary.latencyMs.avg,
          latencyP95Ms: summary.latencyMs.p95,
          slowRequestsCount: summary.slowRequestsCount,
        },
      },
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
