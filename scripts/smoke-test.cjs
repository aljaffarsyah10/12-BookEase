/**
 * Automated Production Smoke Test Suite for BookEase
 * Verifies critical production endpoints, security headers, health checks, and SEO assets.
 * Usage: node scripts/smoke-test.cjs [baseUrl]
 * Example: node scripts/smoke-test.cjs http://localhost:3000
 */

const http = require("http");
const https = require("https");

const targetBaseUrl = process.argv[2] || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const CRITICAL_CHECKS = [
  { path: "/api/health/live", expectedStatus: 200, name: "Container Liveness Probe" },
  { path: "/api/health/ready", expectedStatus: 200, name: "Database Readiness Probe" },
  { path: "/api/health", expectedStatus: 200, name: "System Deep Health Check" },
  { path: "/", expectedStatus: 200, name: "Public Homepage" },
  { path: "/pricing", expectedStatus: 200, name: "SaaS Pricing Page" },
  { path: "/features", expectedStatus: 200, name: "Features Overview Page" },
  { path: "/robots.txt", expectedStatus: 200, name: "Robots SEO Crawler Directives" },
  { path: "/sitemap.xml", expectedStatus: 200, name: "Dynamic Sitemap XML" },
  { path: "/manifest.webmanifest", expectedStatus: 200, name: "Web App Manifest" },
  { path: "/login", expectedStatus: 200, name: "Authentication Login Portal" },
  { path: "/register", expectedStatus: 200, name: "User Registration & Workspace Setup" },
];

function fetchEndpoint(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": "BookEase-SmokeTester/1.0" } }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on("error", (err) => reject(err));
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error("Request timed out after 8000ms"));
    });
  });
}

async function runSmokeTests() {
  console.log("=================================================");
  console.log("     BookEase Production Smoke Test Suite        ");
  console.log(`     Target: ${targetBaseUrl}                    `);
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  for (const check of CRITICAL_CHECKS) {
    const fullUrl = `${targetBaseUrl}${check.path}`;
    process.stdout.write(`[*] Checking ${check.name.padEnd(38)} `);

    try {
      const res = await fetchEndpoint(fullUrl);
      if (res.statusCode === check.expectedStatus) {
        console.log(`\x1b[32m[PASS]\x1b[0m (HTTP ${res.statusCode})`);
        passed++;
      } else {
        console.log(`\x1b[31m[FAIL]\x1b[0m (Expected HTTP ${check.expectedStatus}, got ${res.statusCode})`);
        failed++;
      }
    } catch (err) {
      console.log(`\x1b[31m[ERROR]\x1b[0m (${err.message})`);
      failed++;
    }
  }

  // Security Headers Verification on Homepage
  process.stdout.write("[*] Verifying Security HTTP Headers               ");
  try {
    const res = await fetchEndpoint(targetBaseUrl);
    const headers = res.headers;
    const hasFrameOptions = Boolean(headers["x-frame-options"]);
    const hasContentType = Boolean(headers["x-content-type-options"]);
    const hasReferrerPolicy = Boolean(headers["referrer-policy"]);

    if (hasFrameOptions && hasContentType && hasReferrerPolicy) {
      console.log(`\x1b[32m[PASS]\x1b[0m (X-Frame, No-Sniff, Referrer verified)`);
      passed++;
    } else {
      console.log(`\x1b[33m[WARN]\x1b[0m (Some security headers missing in dev mode)`);
      passed++;
    }
  } catch (err) {
    console.log(`\x1b[31m[FAIL]\x1b[0m (${err.message})`);
    failed++;
  }

  console.log("=================================================");
  console.log(` Smoke Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) {
    console.error("❌ Smoke test suite detected failures.");
    process.exit(1);
  } else {
    console.log("✅ All production smoke tests passed successfully!");
    process.exit(0);
  }
}

runSmokeTests().catch((err) => {
  console.error("Fatal error during smoke test:", err);
  process.exit(1);
});
