---
name: "observability-pass"
description: "Improve operational visibility: structured logging, health checks, metrics hooks, tracing points, and runtime diagnostics. Use when: the repo needs better logs, health endpoints, or easier diagnosis of runtime failures. Keywords: observability, logging, metrics, tracing, health check, readiness, monitoring, telemetry, correlation, structured log, signal, operational, diagnosis."
---

# Observability Pass

Add or improve the operational signals that help developers and operators understand what the application is doing at runtime.

## When to Use

- Application failures are hard to diagnose from current logs
- No health or readiness endpoint exists
- Logs are unstructured, noisy, or missing context
- A new service or integration needs operational visibility
- Before a release where runtime diagnostics matter
- After adding background jobs, queues, or external service calls

## Required Context

1. **Read `PRD.md`** if it exists — understand operational requirements or SLA expectations.
2. **Read `README.md`** if it exists — check for existing observability documentation.
3. **Read application entrypoints** — `app/`, `server.ts`, API routes, middleware.
4. **Read existing logging** — search for `console.log`, `console.error`, or structured logger usage.
5. **Read `package.json`** — check for logging or telemetry dependencies.
6. Do not create `docs/plan.md` or any duplicate primary planning document.

## Procedure

### Step 1 — Assess Current State

Inventory what exists:

| Signal | Status | Details |
|--------|--------|---------|
| **Structured logging** | present / partial / absent | Logger library? JSON format? |
| **Request correlation** | present / absent | Request ID propagated through handlers? |
| **Health endpoint** | present / absent | `/health` or `/api/health` returning status? |
| **Readiness check** | present / absent | Checks dependencies before accepting traffic? |
| **Error reporting** | present / partial / absent | Errors captured with context? |
| **Metrics** | present / absent | Request count, latency, error rate? |
| **Tracing** | present / absent | Distributed tracing spans? |

Classify current maturity:

| Level | Description |
|-------|------------|
| **None** | `console.log` only, no health endpoint, no structure |
| **Basic** | Some structured logging, health endpoint exists |
| **Functional** | Structured logging with correlation, health + readiness, error context |
| **Comprehensive** | Metrics, tracing, alerting hooks, dashboard-ready |

Most projects should target **Functional**. Only add **Comprehensive** when the project genuinely needs it.

### Step 2 — Structured Logging

If logging is unstructured (`console.log` strings):

**Minimum improvement:**
- Use a consistent log format: `{ level, message, timestamp, ...context }`
- Include relevant context: request ID, user action, affected resource
- Use appropriate levels: `error` for failures, `warn` for degraded state, `info` for key events, `debug` for development

**Principles:**
- Log at boundaries (request in, response out, external call, error caught)
- Include enough context to reconstruct what happened
- Do not log on every iteration of a loop or every function call
- Do not log full request/response bodies (too noisy, may contain secrets)

**What to log:**

| Event | Level | Context |
|-------|-------|---------|
| Request received | info | method, path, request ID |
| Response sent | info | status, duration, request ID |
| External call made | info | service, endpoint, duration |
| Error caught | error | error message, stack, request ID, affected resource |
| Degraded state | warn | what degraded, fallback used |
| Important business event | info | what happened, relevant IDs |

**What NOT to log:**
- Passwords, tokens, API keys, session IDs
- Full request bodies (may contain PII)
- Every database query (use debug level if needed)
- Success of routine operations (too noisy)

### Step 3 — Health and Readiness Endpoints

**Health endpoint** (`/health` or `/api/health`):
- Returns 200 when the application process is running
- Minimal check — does not verify dependencies
- Used by load balancers and container orchestrators for liveness

**Readiness endpoint** (`/ready` or `/api/ready`):
- Returns 200 when the application can serve requests
- Checks critical dependencies (database connection, required services)
- Returns 503 with detail when not ready
- Used by orchestrators to control traffic routing

Example response:

```json
{
  "status": "ok",
  "timestamp": "2026-03-28T12:00:00Z",
  "checks": {
    "database": "ok",
    "cache": "ok"
  }
}
```

Only check dependencies the app actually uses. Do not add checks for services that do not exist.

### Step 4 — Request Correlation

Ensure every request can be traced through the system:

- Generate a unique request ID at the entry point (or accept from `X-Request-Id` header)
- Propagate the ID through handlers, service calls, and error reporting
- Include the ID in every log line for that request
- Return the ID in the response header for client-side correlation

### Step 5 — Error Context

Improve error handling to include diagnostic context:

- Catch errors at boundaries (API routes, middleware)
- Log the error with: message, stack trace, request ID, affected resource, user action
- Return safe error responses to clients (no stack traces, no internal paths)
- Distinguish expected errors (validation, not found) from unexpected errors (crashes, timeouts)

### Step 6 — Metrics Hooks (When Justified)

Only add metrics if the project has a metrics consumer (Prometheus, Datadog, custom dashboard):

| Metric | Type | Purpose |
|--------|------|---------|
| Request count | counter | Traffic volume |
| Request duration | histogram | Latency distribution |
| Error rate | counter | Failure frequency |
| Active connections | gauge | Concurrent load |

If no metrics infrastructure exists, skip this step. Do not add metrics that nobody will read.

### Step 7 — Tracing (When Justified)

Only add tracing if the application has multiple services or complex async flows:

- Add spans at service boundaries
- Include span context in logs
- Propagate trace context through HTTP headers

For single-service applications, structured logging with request correlation provides equivalent diagnostic value.

### Step 8 — Verify Observability

Confirm the signals work:

| Check | How to Verify |
|-------|--------------|
| Structured logs | Start app, make request, inspect log output |
| Health endpoint | `curl localhost:<port>/health` returns 200 |
| Readiness endpoint | `curl localhost:<port>/ready` returns 200 with checks |
| Request correlation | Make request, verify same ID appears in all related logs |
| Error context | Trigger an error, verify log includes context |
| No secret leakage | Search logs for patterns that look like tokens or passwords |

### Step 9 — Documentation

Update when relevant:

- **README.md** — when health endpoints, logging modes, or local debugging instructions changed
- **`docs/observability.md`** — when the observability architecture has lasting detail worth preserving (log format, metric names, tracing setup)

## Output Format

```
## Observable Signals Added

### Current State
- Maturity: [none | basic | functional | comprehensive]
- Previous signals: [what existed]

### Changes Made
| Signal | Type | Location | Details |
|--------|------|----------|---------|
| ... | logging / health / metrics / tracing | file:line | what was added |

### Verification
| Check | Result |
|-------|--------|
| Structured logs | pass/fail/n/a |
| Health endpoint | pass/fail/n/a |
| Readiness endpoint | pass/fail/n/a |
| Request correlation | pass/fail/n/a |
| Error context | pass/fail/n/a |
| No secret leakage | pass/fail |

### Documentation Updated
- [files updated — or "no updates needed"]

### Signals Not Added (and Why)
- [signals skipped with rationale — e.g., "metrics: no consumer exists"]

### Observable Signals Added
**[Improved from <previous level> to <current level>]**

Recommended verification: [how verifier should confirm observability is wired — specific commands or checks]
```

## Rules

- Prefer a few high-value signals over telemetry sprawl. Every signal should help someone diagnose a real problem.
- Avoid noisy logging. If a log line fires on every request and nobody reads it, remove it.
- Never leak secrets in logs. Search for passwords, tokens, and API keys in log output.
- Do not add metrics or tracing infrastructure unless there is a consumer for the data.
- Do not wrap every function in logging. Log at boundaries, not internals.
- Preserve application performance. Logging and telemetry should not measurably slow the application.
- End with a section titled **"Observable Signals Added"** listing what was added, the maturity improvement, and how to verify.
