import { check, sleep } from "k6";
import http from "k6/http";
import { Rate, Trend } from "k6/metrics";

/**
 * k6 load test — Lesson flow
 *
 * Simulates a student navigating to the dashboard, opening a lesson,
 * fetching their progress, and updating progress.
 *
 * Usage:  k6 run tests/load/lesson-flow.js
 * Override base URL:  k6 run -e BASE_URL=https://staging.example.com tests/load/lesson-flow.js
 */

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const errorRate = new Rate("errors");
const dashboardDuration = new Trend("dashboard_duration");
const lessonDuration = new Trend("lesson_duration");
const progressGetDuration = new Trend("progress_get_duration");
const progressPutDuration = new Trend("progress_put_duration");

export const options = {
  stages: [
    { duration: "2m", target: 400 }, // ramp up to 400 VUs
    { duration: "5m", target: 400 }, // sustain 400 VUs
    { duration: "1m", target: 0 }, // ramp down
  ],
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
  "environment-variables",
];

export default function () {
  // 1. Visit dashboard
  const dashRes = http.get(`${BASE_URL}/dashboard`);
  dashboardDuration.add(dashRes.timings.duration);
  const dashOk = check(dashRes, {
    "dashboard status is 200": (r) => r.status === 200,
  });
  errorRate.add(!dashOk);

  sleep(1);

  // 2. Navigate to a lesson page
  const lessonId = LESSON_IDS[Math.floor(Math.random() * LESSON_IDS.length)];
  const lessonRes = http.get(`${BASE_URL}/lessons/${lessonId}`);
  lessonDuration.add(lessonRes.timings.duration);
  const lessonOk = check(lessonRes, {
    "lesson page status is 200 or 302": (r) =>
      r.status === 200 || r.status === 302,
  });
  errorRate.add(!lessonOk);

  sleep(0.5);

  // 3. Fetch progress
  const progressGetRes = http.get(`${BASE_URL}/api/progress`);
  progressGetDuration.add(progressGetRes.timings.duration);
  const getOk = check(progressGetRes, {
    "GET /api/progress returns 200 or 401": (r) =>
      r.status === 200 || r.status === 401,
  });
  errorRate.add(!getOk);

  sleep(0.5);

  // 4. Update progress
  const payload = JSON.stringify({
    lessonId,
    step: Math.floor(Math.random() * 4),
    completed: Math.random() > 0.7,
  });

  const progressPutRes = http.put(`${BASE_URL}/api/progress`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  progressPutDuration.add(progressPutRes.timings.duration);
  const putOk = check(progressPutRes, {
    "PUT /api/progress returns 200 or 401": (r) =>
      r.status === 200 || r.status === 401,
  });
  errorRate.add(!putOk);

  sleep(1);
}
