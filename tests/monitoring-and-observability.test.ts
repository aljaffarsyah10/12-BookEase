import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node experimental strip types requires extension
import { maskSensitiveData, logger } from "../src/lib/logger.ts";
// @ts-expect-error Node experimental strip types requires extension
import { metrics } from "../src/lib/metrics.ts";
// @ts-expect-error Node experimental strip types requires extension
import { errorTracker } from "../src/lib/error-tracker.ts";
// @ts-expect-error Node experimental strip types requires extension
import { alerting } from "../src/lib/alerting.ts";

test("Logger: maskSensitiveData recursively masks secrets and PII", () => {
  const sensitivePayload = {
    user: "john_doe",
    email: "john@example.com",
    password: "super_secret_password_123",
    passwordHash: "$2a$12$abcdefghijklmnopqrstuvwxyz",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdef",
    creditCard: "4111222233334444",
    nested: {
      apiKey: "normal_key",
      secret: "shhh_super_secret",
      sessionToken: "session_token_value",
    },
    items: [{ id: 1, name: "Book" }, { id: 2, authorization: "Bearer xyz" }],
  };

  const masked = maskSensitiveData(sensitivePayload) as Record<string, unknown>;

  assert.equal(masked.user, "john_doe");
  assert.equal(masked.email, "john@example.com");
  assert.equal(masked.password, "[REDACTED]");
  assert.equal(masked.passwordHash, "[REDACTED]");
  assert.equal(masked.creditCard, "[REDACTED]");

  const nested = masked.nested as Record<string, unknown>;
  assert.equal(nested.secret, "[REDACTED]");
  assert.equal(nested.sessionToken, "[REDACTED]");

  const items = masked.items as Array<Record<string, unknown>>;
  assert.equal(items[1].authorization, "[REDACTED]");
});

test("Metrics Registry: records HTTP request latencies and aggregates status codes", () => {
  metrics.reset();

  const now = Date.now();

  metrics.recordRequest({
    path: "/api/v1/services",
    method: "GET",
    statusCode: 200,
    durationMs: 40,
    timestamp: now,
  });

  metrics.recordRequest({
    path: "/api/v1/bookings",
    method: "POST",
    statusCode: 201,
    durationMs: 120,
    timestamp: now,
  });

  metrics.recordRequest({
    path: "/api/v1/bookings/invalid",
    method: "GET",
    statusCode: 404,
    durationMs: 15,
    timestamp: now,
  });

  metrics.recordRequest({
    path: "/api/v1/reports",
    method: "GET",
    statusCode: 500,
    durationMs: 1250, // Slow request (> 1000ms)
    timestamp: now,
  });

  const summary = metrics.getSummary();

  assert.equal(summary.totalRequests, 4);
  assert.equal(summary.statusCodes["2xx"], 2);
  assert.equal(summary.statusCodes["4xx"], 1);
  assert.equal(summary.statusCodes["5xx"], 1);
  assert.equal(summary.slowRequestsCount, 1);
  assert.ok(summary.latencyMs.max >= 1250);
  assert.ok(summary.memory.heapUsedMb > 0);
});

test("Error Tracker: clusters errors by fingerprint, maintains breadcrumbs and deduplicates", () => {
  errorTracker.clear();

  errorTracker.addBreadcrumb("navigation", "User navigated to /dashboard/services");
  errorTracker.addBreadcrumb("ui", "User clicked Add Service button");

  const simulatedError = new Error("Database deadlock detected");
  const event1 = errorTracker.captureException(simulatedError, { path: "/api/v1/services" });

  assert.ok(event1.id.startsWith("err_"));
  assert.equal(event1.name, "Error");
  assert.equal(event1.message, "Database deadlock detected");
  assert.equal(event1.count, 1);
  assert.equal(event1.breadcrumbs.length, 2);

  // Second occurrence of same error at same location
  const event2 = errorTracker.captureException(simulatedError, { path: "/api/v1/services" });
  assert.equal(event2.fingerprint, event1.fingerprint);
  assert.equal(event2.count, 2); // Deduplicated and count incremented

  // Resolution
  const resolved = errorTracker.resolveError(event1.fingerprint);
  assert.equal(resolved, true);

  const list = errorTracker.getRecentErrors();
  assert.equal(list.length, 1);
  assert.equal(list[0].status, "resolved");
});

test("Alerting Service: enforces debouncing cooldown to prevent alert storms", async () => {
  alerting.resetCooldowns();

  // First alert should dispatch successfully
  const firstDispatch = await alerting.dispatchAlert("test_alert_key", {
    title: "High Error Spike",
    message: "Error rate exceeded 10%",
    severity: "CRITICAL",
    source: "API",
  });
  assert.equal(firstDispatch, true);

  // Immediate second alert with same key should be suppressed by cooldown
  const secondDispatch = await alerting.dispatchAlert("test_alert_key", {
    title: "High Error Spike",
    message: "Error rate exceeded 10%",
    severity: "CRITICAL",
    source: "API",
  });
  assert.equal(secondDispatch, false);
});

test("Database Latency Evaluation: categorizes latency levels accurately", () => {
  function evaluateStatus(latencyMs: number): "healthy" | "degraded" | "unhealthy" {
    if (latencyMs < 0) return "unhealthy";
    if (latencyMs > 200) return "degraded";
    return "healthy";
  }

  assert.equal(evaluateStatus(15), "healthy");
  assert.equal(evaluateStatus(150), "healthy");
  assert.equal(evaluateStatus(280), "degraded");
  assert.equal(evaluateStatus(-1), "unhealthy");
});

test("Logger Request ID: generates unique collision-resistant IDs", () => {
  const id1 = logger.generateRequestId();
  const id2 = logger.generateRequestId();

  assert.ok(id1.startsWith("req_"));
  assert.ok(id2.startsWith("req_"));
  assert.notEqual(id1, id2);
});
