export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface AlertPayload {
  title: string;
  message: string;
  severity: AlertSeverity;
  source: "API" | "DATABASE" | "MEMORY" | "APPLICATION";
  metadata?: Record<string, unknown>;
  timestamp: string;
}

class AlertingService {
  private alertCooldowns: Map<string, number> = new Map();
  private cooldownDurationMs = 10 * 60 * 1000; // 10 minutes debounce per alert type
  private consecutiveErrors = 0;
  private readonly consecutiveErrorThreshold = 5;

  /**
   * Dispatch alert to configured channels with automatic deduplication / cooldown
   */
  public async dispatchAlert(
    key: string,
    alert: Omit<AlertPayload, "timestamp">
  ): Promise<boolean> {
    const now = Date.now();
    const lastAlerted = this.alertCooldowns.get(key);

    if (lastAlerted && now - lastAlerted < this.cooldownDurationMs) {
      // Alert in cooldown, suppress to prevent notification storm
      return false;
    }

    this.alertCooldowns.set(key, now);

    const payload: AlertPayload = {
      ...alert,
      timestamp: new Date().toISOString(),
    };

    // Log the alert
    if (process.env.NODE_ENV !== "test") {
      if (alert.severity === "CRITICAL") {
        console.error(`🚨 [ALERT - ${alert.severity}] ${alert.title}: ${alert.message}`, alert.metadata || "");
      } else {
        console.warn(`⚠️ [ALERT - ${alert.severity}] ${alert.title}: ${alert.message}`, alert.metadata || "");
      }
    }

    // Forward to Webhook if ALERT_WEBHOOK_URL is configured (Slack / Discord / Teams format)
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `*[BookEase Alert - ${payload.severity}]* ${payload.title}\n${payload.message}`,
            attachments: [
              {
                color: payload.severity === "CRITICAL" ? "#ef4444" : "#f59e0b",
                fields: [
                  { title: "Source", value: payload.source, short: true },
                  { title: "Timestamp", value: payload.timestamp, short: true },
                  ...(payload.metadata
                    ? [
                        {
                          title: "Metadata",
                          value: JSON.stringify(payload.metadata, null, 2),
                          short: false,
                        },
                      ]
                    : []),
                ],
              },
            ],
          }),
        });
      } catch (webhookErr) {
        console.error("[Alerting] Failed to deliver alert to webhook URL:", webhookErr);
      }
    }

    return true;
  }

  /**
   * Track consecutive HTTP 5xx errors and trigger alert if threshold exceeded
   */
  public recordHttpResult(statusCode: number, path: string): void {
    if (statusCode >= 500) {
      this.consecutiveErrors++;
      if (this.consecutiveErrors >= this.consecutiveErrorThreshold) {
        this.dispatchAlert("consecutive_5xx_errors", {
          title: "Lonjakan Error 5xx Terdeteksi",
          message: `Terjadi ${this.consecutiveErrors} error server berturut-turut pada endpoint ${path}.`,
          severity: "CRITICAL",
          source: "API",
          metadata: { consecutiveCount: this.consecutiveErrors, endpoint: path },
        });
      }
    } else {
      this.consecutiveErrors = 0; // Reset streak on healthy response
    }
  }

  /**
   * Check database latency and alert if exceeding critical threshold
   */
  public evaluateDatabaseLatency(latencyMs: number): void {
    if (latencyMs > 500) {
      this.dispatchAlert("db_latency_high", {
        title: "Latensi Database Tinggi",
        message: `Query database membutuhkan waktu ${latencyMs}ms (> 500ms batas toleransi).`,
        severity: "WARNING",
        source: "DATABASE",
        metadata: { latencyMs },
      });
    }
  }

  /**
   * Check memory usage and alert if exceeding critical threshold
   */
  public evaluateMemoryUsage(usedMb: number, totalMb: number): void {
    if (totalMb > 0) {
      const percentage = (usedMb / totalMb) * 100;
      if (percentage >= 90) {
        this.dispatchAlert("high_memory_utilization", {
          title: "Konsumsi Memori Sangat Tinggi",
          message: `Penggunaan heap memori mencapai ${percentage.toFixed(1)}% (${usedMb}MB / ${totalMb}MB).`,
          severity: "CRITICAL",
          source: "MEMORY",
          metadata: { usedMb, totalMb, percentage: `${percentage.toFixed(1)}%` },
        });
      }
    }
  }

  public resetCooldowns(): void {
    this.alertCooldowns.clear();
    this.consecutiveErrors = 0;
  }
}

export const alerting = new AlertingService();
