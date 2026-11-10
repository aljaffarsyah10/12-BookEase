import { alerting } from "./alerting";
import { logger } from "./logger";
import { prisma } from "./prisma";

export interface DatabaseHealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  message: string;
  timestamp: string;
  pool?: {
    connected: boolean;
  };
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const start = performance.now();
  const timestamp = new Date().toISOString();

  try {
    // Execute low-overhead connectivity query
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - start);

    // Evaluate database latency alerting
    alerting.evaluateDatabaseLatency(latencyMs);

    if (latencyMs > 200) {
      logger.warn(`[DB_MONITOR] Slow database query detected: ${latencyMs}ms`, {
        latencyMs,
      });
      return {
        status: "degraded",
        latencyMs,
        message: `Database responsif namun mengalami latensi (${latencyMs}ms).`,
        timestamp,
        pool: { connected: true },
      };
    }

    return {
      status: "healthy",
      latencyMs,
      message: `Database PostgreSQL normal (${latencyMs}ms).`,
      timestamp,
      pool: { connected: true },
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const errorMessage = err instanceof Error ? err.message : String(err);

    logger.error("[DB_MONITOR] Database health check failed:", err, {
      latencyMs,
    });

    await alerting.dispatchAlert("database_connection_failure", {
      title: "Koneksi Database Terputus",
      message: `Pemeriksaan kesehatan database gagal: ${errorMessage}`,
      severity: "CRITICAL",
      source: "DATABASE",
      metadata: { latencyMs, error: errorMessage },
    });

    return {
      status: "unhealthy",
      latencyMs,
      message: `Database tidak dapat diakses: ${errorMessage}`,
      timestamp,
      pool: { connected: false },
    };
  }
}
