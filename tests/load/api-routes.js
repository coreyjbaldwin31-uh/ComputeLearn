import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

/**
 * k6 load test — API routes
 *
 * Exercises the main API endpoints under sustained load.
 *
 * Usage:  k6 run tests/load/api-routes.js
 * Override base URL:  k6 run -e BASE_URL=https://staging.example.com tests/load/api-routes.js
 */

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const errorRate = new Rate("errors");

export const options = {
  vus: 200,
  duration: "3m",
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
    errors: ["rate<0.01"],
  },
};

const LESSON_IDS = [
  "filesystem-basics",
  "what-is-a-computer",
  "terminal-intro",
  "files-and-paths",
];

export default function () {
  const headers = { "Content-Type": "application/json" };

  // GET /api/progress
  const progressRes = http.get(`${BASE_URL}/api/progress`);
  const progressOk = check(progressRes, {
    "GET /api/progress ok": (r) => r.status === 200 || r.status === 401,
  });
  errorRate.add(!progressOk);

  sleep(0.3);

  // PUT /api/progress
  const lessonId = LESSON_IDS[Math.floor(Math.random() * LESSON_IDS.length)];
  const putRes = http.put(
    `${BASE_URL}/api/progress`,
    JSON.stringify({ lessonId, step: 1, completed: false }),
    { headers },
  );
  const putOk = check(putRes, {
    "PUT /api/progress ok": (r) => r.status === 200 || r.status === 401,
  });
  errorRate.add(!putOk);

  sleep(0.3);

  // GET /api/competencies
  const compRes = http.get(`${BASE_URL}/api/competencies`);
  const compOk = check(compRes, {
    "GET /api/competencies ok": (r) => r.status === 200 || r.status === 401,
  });
  errorRate.add(!compOk);

  sleep(0.3);

  // GET /api/submissions
  const subRes = http.get(`${BASE_URL}/api/submissions`);
  const subOk = check(subRes, {
    "GET /api/submissions ok": (r) => r.status === 200 || r.status === 401,
  });
  errorRate.add(!subOk);

  sleep(0.3);

  // GET /api/lab-attempts
  const labRes = http.get(`${BASE_URL}/api/lab-attempts`);
  const labOk = check(labRes, {
    "GET /api/lab-attempts ok": (r) => r.status === 200 || r.status === 401,
  });
  errorRate.add(!labOk);

  sleep(0.5);
}
