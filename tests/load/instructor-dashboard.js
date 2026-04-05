import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

/**
 * k6 load test — Instructor dashboard
 *
 * Simulates instructor-level dashboard load with many students.
 *
 * Usage:  k6 run tests/load/instructor-dashboard.js
 * Override base URL:  k6 run -e BASE_URL=https://staging.example.com tests/load/instructor-dashboard.js
 */

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const errorRate = new Rate("errors");

export const options = {
  vus: 50,
  duration: "2m",
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
    errors: ["rate<0.01"],
  },
};

export default function () {
  // Instructor dashboard page
  const dashRes = http.get(`${BASE_URL}/instructor`);
  const dashOk = check(dashRes, {
    "instructor dashboard status ok": (r) =>
      r.status === 200 || r.status === 302 || r.status === 401,
  });
  errorRate.add(!dashOk);

  sleep(1);

  // Instructor submissions list
  const subRes = http.get(`${BASE_URL}/api/instructor/submissions`);
  const subOk = check(subRes, {
    "GET /api/instructor/submissions ok": (r) =>
      r.status === 200 || r.status === 401 || r.status === 403,
  });
  errorRate.add(!subOk);

  sleep(0.5);

  // Gradebook export
  const exportRes = http.get(
    `${BASE_URL}/api/instructor/gradebook/export`,
  );
  const exportOk = check(exportRes, {
    "GET /api/instructor/gradebook/export ok": (r) =>
      r.status === 200 || r.status === 401 || r.status === 403,
  });
  errorRate.add(!exportOk);

  sleep(1);
}
