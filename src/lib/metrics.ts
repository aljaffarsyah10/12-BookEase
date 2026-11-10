export interface RequestMetric {
  path: string;
  method: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

export interface MetricSummary {
  uptimeSeconds: number;
  totalRequests: number;
  statusCodes: {
    "2xx": number;
    "3xx": number;
    "4xx": number;
    "5xx": number;
  };
  latencyMs: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    max: number;
    min: number;
  };
  recentErrorRatePercent: number; // Error rate over last 5 minutes
  slowRequestsCount: number; // Duration > 1000ms
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
}

class MetricsRegistry {
  private startTime = Date.now();
  private totalRequests = 0;
  private statusCodes = {
    "2xx": 0,
    "3xx": 0,
    "4xx": 0,
    "5xx": 0,
  };
  private slowRequestsCount = 0;
  private recentRequests: RequestMetric[] = [];
  private readonly maxRecentSamples = 500;
  private readonly slowThresholdMs = 1000;

  public recordRequest(metric: RequestMetric): void {
    this.totalRequests++;

    const statusCategory = Math.floor(metric.statusCode / 100);
    if (statusCategory === 2) this.statusCodes["2xx"]++;
    else if (statusCategory === 3) this.statusCodes["3xx"]++;
    else if (statusCategory === 4) this.statusCodes["4xx"]++;
    else if (statusCategory === 5) this.statusCodes["5xx"]++;

    if (metric.durationMs >= this.slowThresholdMs) {
      this.slowRequestsCount++;
    }

    this.recentRequests.push(metric);
    if (this.recentRequests.length > this.maxRecentSamples) {
      this.recentRequests.shift();
    }
  }

  public getSummary(): MetricSummary {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // Filter requests from last 5 minutes for dynamic error rate
    const windowRequests = this.recentRequests.filter(
      (r) => r.timestamp >= fiveMinutesAgo
    );

    let errorCount = 0;
    for (const r of windowRequests) {
      if (r.statusCode >= 500) errorCount++;
    }

    const recentErrorRatePercent =
      windowRequests.length > 0
        ? Math.round((errorCount / windowRequests.length) * 1000) / 10
        : 0;

    // Compute latency percentiles from recent requests
    const durations = this.recentRequests
      .map((r) => r.durationMs)
      .sort((a, b) => a - b);

    const calcPercentile = (pct: number) => {
      if (durations.length === 0) return 0;
      const index = Math.min(
        durations.length - 1,
        Math.floor((pct / 100) * durations.length)
      );
      return Math.round(durations[index]);
    };

    const sum = durations.reduce((acc, d) => acc + d, 0);
    const avg = durations.length > 0 ? Math.round(sum / durations.length) : 0;
    const min = durations.length > 0 ? Math.round(durations[0]) : 0;
    const max =
      durations.length > 0 ? Math.round(durations[durations.length - 1]) : 0;

    const mem = process.memoryUsage();

    return {
      uptimeSeconds: Math.floor((now - this.startTime) / 1000),
      totalRequests: this.totalRequests,
      statusCodes: { ...this.statusCodes },
      latencyMs: {
        avg,
        p50: calcPercentile(50),
        p95: calcPercentile(95),
        p99: calcPercentile(99),
        min,
        max,
      },
      recentErrorRatePercent,
      slowRequestsCount: this.slowRequestsCount,
      memory: {
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        rssMb: Math.round(mem.rss / 1024 / 1024),
      },
    };
  }

  public reset(): void {
    this.totalRequests = 0;
    this.statusCodes = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 };
    this.slowRequestsCount = 0;
    this.recentRequests = [];
  }
}

export const metrics = new MetricsRegistry();
