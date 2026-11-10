import crypto from "crypto";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "session",
  "secret",
  "authorization",
  "cookie",
  "creditcard",
  "cvv",
  "pin",
  "cancellationtoken",
]);

/**
 * Recursively mask sensitive fields from objects before logging
 */
export function maskSensitiveData(data: unknown, depth = 0): unknown {
  if (depth > 5) return "[MaxDepthReached]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    // Mask potential JWT / token strings
    if (data.length > 40 && data.includes(".")) {
      return `${data.slice(0, 6)}...[REDACTED]`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, depth + 1));
  }

  if (typeof data === "object") {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, "");
      const isSensitive = Array.from(SENSITIVE_KEYS).some((s) => lowerKey.includes(s));
      if (isSensitive) {
        masked[key] = "[REDACTED]";
      } else {
        masked[key] = maskSensitiveData(value, depth + 1);
      }
    }
    return masked;
  }

  return data;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  context?: Record<string, unknown>;
  durationMs?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private minLevel: LogLevel =
    (process.env.LOG_LEVEL as LogLevel) ||
    (process.env.NODE_ENV === "production" ? "INFO" : "DEBUG");

  public generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  private write(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    err?: unknown,
    durationMs?: number
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context?.requestId ? { requestId: String(context.requestId) } : {}),
      ...(context ? { context: maskSensitiveData(context) as Record<string, unknown> } : {}),
      ...(typeof durationMs === "number" ? { durationMs } : {}),
    };

    if (err) {
      if (err instanceof Error) {
        entry.error = {
          name: err.name,
          message: err.message,
          stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
          ...("code" in err && typeof err.code === "string" ? { code: err.code } : {}),
        };
      } else {
        entry.error = {
          name: "UnknownError",
          message: String(err),
        };
      }
    }

    if (!this.shouldLog(level)) {
      return entry;
    }

    // Output formatting: JSON lines in production, formatted in development
    if (process.env.NODE_ENV === "production") {
      const jsonLine = JSON.stringify(entry);
      if (level === "ERROR" || level === "FATAL") {
        console.error(jsonLine);
      } else if (level === "WARN") {
        console.warn(jsonLine);
      } else {
        console.log(jsonLine);
      }
    } else {
      const time = entry.timestamp.split("T")[1]?.slice(0, 8) || "";
      const prefix = `[${time}] [${level}]`;
      const dur = durationMs ? ` (${durationMs.toFixed(1)}ms)` : "";
      const req = entry.requestId ? ` [${entry.requestId}]` : "";

      if (level === "ERROR" || level === "FATAL") {
        console.error(`${prefix}${req} ${message}${dur}`, entry.context || "", entry.error || "");
      } else if (level === "WARN") {
        console.warn(`${prefix}${req} ${message}${dur}`, entry.context || "");
      } else {
        console.log(`${prefix}${req} ${message}${dur}`, entry.context || "");
      }
    }

    return entry;
  }

  public debug(message: string, context?: Record<string, unknown>): LogEntry {
    return this.write("DEBUG", message, context);
  }

  public info(
    message: string,
    context?: Record<string, unknown>,
    durationMs?: number
  ): LogEntry {
    return this.write("INFO", message, context, undefined, durationMs);
  }

  public warn(
    message: string,
    context?: Record<string, unknown>,
    durationMs?: number
  ): LogEntry {
    return this.write("WARN", message, context, undefined, durationMs);
  }

  public error(
    message: string,
    err?: unknown,
    context?: Record<string, unknown>,
    durationMs?: number
  ): LogEntry {
    return this.write("ERROR", message, context, err, durationMs);
  }

  public fatal(
    message: string,
    err?: unknown,
    context?: Record<string, unknown>
  ): LogEntry {
    return this.write("FATAL", message, context, err);
  }
}

export const logger = new Logger();
