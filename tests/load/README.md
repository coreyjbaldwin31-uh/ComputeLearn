# Load Tests

k6 load test scripts for the ComputeLearn platform.

## Prerequisites

Install k6 on your machine. k6 is **not** an npm package — it requires a separate install.

- **macOS:** `brew install k6`
- **Windows:** `choco install k6` or `winget install k6`
- **Linux:** See <https://grafana.com/docs/k6/latest/set-up/install-k6/>
- **Docker:** `docker run --rm -i grafana/k6 run - <tests/load/lesson-flow.js`

Verify: `k6 version`

## Scripts

| Script                    | VUs | Duration | Scenario                                  |
| ------------------------- | --- | -------- | ----------------------------------------- |
| `lesson-flow.js`          | 400 | 8 min    | Student lesson navigation + progress CRUD |
| `api-routes.js`           | 200 | 3 min    | Core API endpoint throughput              |
| `instructor-dashboard.js` | 50  | 2 min    | Instructor dashboard + gradebook export   |

## Running

Start the application first (`npm run dev` or `docker compose up`), then:

```bash
# Primary lesson-flow test (default npm script)
npm run load-test

# Individual scripts
k6 run tests/load/lesson-flow.js
k6 run tests/load/api-routes.js
k6 run tests/load/instructor-dashboard.js

# Override the base URL for staging/production
k6 run -e BASE_URL=https://staging.example.com tests/load/lesson-flow.js
```

## Thresholds

All scripts share these performance targets:

| Metric            | Target   |
| ----------------- | -------- |
| HTTP P95 latency  | < 500 ms |
| HTTP failure rate | < 1%     |

k6 exits with a non-zero code if any threshold is breached.

## Interpreting Results

After each run, k6 prints a summary including:

- **http_req_duration** — P50, P90, P95, P99 latency values. The P95 value must stay below 500 ms.
- **http_req_failed** — Ratio of non-2xx/3xx responses. Must stay below 1%.
- **http_reqs** — Total requests made. Higher is better for the same latency.
- **iteration_duration** — Time for one full simulated user scenario.
- **errors** (custom) — Application-level check failures.

If thresholds fail, investigate:

1. Check server logs for errors or timeouts.
2. Look at database query performance (slow queries show up in P95 spikes).
3. Consider connection pool exhaustion if errors spike at high VU counts.
4. Review memory and CPU usage on the server during the test.
