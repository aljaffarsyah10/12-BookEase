import crypto from "crypto";

export interface Breadcrumb {
  category: "ui" | "navigation" | "db" | "auth" | "http";
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface TrackedErrorEvent {
  id: string;
  fingerprint: string;
  name: string;
  message: string;
  stack?: string;
  code?: string;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
  context?: Record<string, unknown>;
  breadcrumbs: Breadcrumb[];
  status: "unresolved" | "resolved";
}

class ErrorTracker {
  private recentErrors: Map<string, TrackedErrorEvent> = new Map();
  private maxStoredErrors = 50;
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 25;

  /**
   * Generate an error fingerprint to cluster identical errors
   */
  public generateFingerprint(err: unknown, path?: string): string {
    const errorName = err instanceof Error ? err.name : "UnknownError";
    const errorMessage = err instanceof Error ? err.message : String(err);
    const location = path || "";

    return crypto
      .createHash("md5")
      .update(`${errorName}:${errorMessage}:${location}`)
      .digest("hex")
      .slice(0, 16);
  }

  public addBreadcrumb(
    category: Breadcrumb["category"],
    message: string,
    data?: Record<string, unknown>
  ): void {
    const crumb: Breadcrumb = {
      category,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    this.breadcrumbs.push(crumb);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  public captureException(
    err: unknown,
    context?: Record<string, unknown>
  ): TrackedErrorEvent {
    const now = new Date().toISOString();
    const path = typeof context?.path === "string" ? context.path : undefined;
    const fingerprint = this.generateFingerprint(err, path);

    const existing = this.recentErrors.get(fingerprint);
    if (existing) {
      existing.count++;
      existing.lastSeenAt = now;
      if (context) {
        existing.context = { ...existing.context, ...context };
      }
      return existing;
    }

    const errorObj = err instanceof Error ? err : new Error(String(err));
    const event: TrackedErrorEvent = {
      id: `err_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
      fingerprint,
      name: errorObj.name,
      message: errorObj.message,
      stack: process.env.NODE_ENV === "production" ? undefined : errorObj.stack,
      code: "code" in errorObj && typeof errorObj.code === "string" ? errorObj.code : undefined,
      count: 1,
      firstSeenAt: now,
      lastSeenAt: now,
      context,
      breadcrumbs: [...this.breadcrumbs],
      status: "unresolved",
    };

    // Store in ring buffer
    if (this.recentErrors.size >= this.maxStoredErrors) {
      const oldestKey = this.recentErrors.keys().next().value;
      if (oldestKey) this.recentErrors.delete(oldestKey);
    }
    this.recentErrors.set(fingerprint, event);

    if (process.env.NODE_ENV !== "test") {
      console.error(`[ErrorTracker] Captured ${event.name}: ${event.message}`, err);
    }

    return event;
  }

  public getRecentErrors(): TrackedErrorEvent[] {
    return Array.from(this.recentErrors.values()).sort(
      (a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
    );
  }

  public resolveError(fingerprint: string): boolean {
    const error = this.recentErrors.get(fingerprint);
    if (error) {
      error.status = "resolved";
      return true;
    }
    return false;
  }

  public clear(): void {
    this.recentErrors.clear();
    this.breadcrumbs = [];
  }
}

export const errorTracker = new ErrorTracker();
