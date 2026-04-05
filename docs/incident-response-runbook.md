# Incident Response Runbook

Operational procedures for responding to ComputeLearn platform incidents.

## Severity Levels

| Level | Name      | Definition                                      | Response Time | Examples                                   |
| ----- | --------- | ----------------------------------------------- | ------------- | ------------------------------------------ |
| P1    | Critical  | Service completely unavailable                  | 15 minutes    | App crash loop, database down, DNS failure |
| P2    | Degraded  | Service partially available or significantly slow | 1 hour       | Auth provider outage, high error rate      |
| P3    | Minor     | Non-critical feature broken                     | 4 hours       | Export fails, one API route errors          |
| P4    | Cosmetic  | Visual or non-functional issue                  | Next sprint   | Styling bug, typo in UI                    |

## Contact Information

| Role               | Contact              | Escalation                            |
| ------------------ | -------------------- | ------------------------------------- |
| On-call engineer   | *(fill in)*          | Slack: #computelearn-oncall           |
| Engineering lead   | *(fill in)*          | Phone escalation after 30 min         |
| Product owner      | *(fill in)*          | Email for P1/P2 incidents             |
| Infrastructure     | *(fill in)*          | For hosting/DNS/database issues       |

## Escalation Path

1. **Detect** — Automated alert (Sentry, health check monitor) or user report.
2. **Acknowledge** — On-call engineer acknowledges within response time for the severity level.
3. **Triage** — Confirm severity, identify affected systems, open an incident channel.
4. **Mitigate** — Apply immediate fix or workaround (rollback, restart, failover).
5. **Resolve** — Deploy a permanent fix, verify with health checks and monitoring.
6. **Review** — Schedule a post-incident review within 3 business days for P1/P2.

## Common Incidents

### Database Connection Failure

**Symptoms:** Health check returns `{ status: "unhealthy", checks: { database: false } }`. API routes return 500 errors.

**Steps:**
1. Check database container/service status: `docker compose ps` or check cloud provider dashboard.
2. Verify `DATABASE_URL` is correct in the environment.
3. Check PostgreSQL logs for connection limit exhaustion or disk space.
4. Restart the database: `docker compose restart postgres`.
5. If persistent, check for lock contention: `SELECT * FROM pg_stat_activity WHERE state = 'active';`
6. If the connection pool is exhausted, restart the app: `docker compose restart app`.

### Authentication Provider Outage

**Symptoms:** Users cannot log in. Google OAuth returns errors.

**Steps:**
1. Check Google Cloud status at https://status.cloud.google.com/.
2. Verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are valid.
3. Check that `NEXTAUTH_URL` matches the deployed domain.
4. If Google is down, communicate to users that login is temporarily unavailable. Existing sessions continue to work.
5. No platform-side fix is possible — wait for provider recovery.

### High Error Rate

**Symptoms:** Sentry alert for elevated error count. Users report failures.

**Steps:**
1. Open Sentry and identify the error(s) driving the spike.
2. Check recent deployments — if the error started after a deploy, roll back immediately.
3. Check server resource usage (memory, CPU) — if a resource is exhausted, scale or restart.
4. If the error is in a specific route, check the route handler logic and database queries.
5. Deploy a fix or hotfix, then verify error rate drops.

### Memory / CPU Exhaustion

**Symptoms:** Slow responses, container restarts, OOM kills in Docker logs.

**Steps:**
1. Check container resource usage: `docker stats`.
2. Identify the container consuming excessive resources.
3. For the app container: check for memory leaks (growing heap), large response payloads, or N+1 queries.
4. Restart the affected container: `docker compose restart app`.
5. If recurring, increase resource limits in `docker-compose.prod.yml` and investigate root cause.

## Post-Incident Review Template

Use this template for P1 and P2 incidents:

```markdown
## Incident Report: [Title]

**Date:** YYYY-MM-DD
**Severity:** P1 / P2
**Duration:** HH:MM start → HH:MM resolved (X minutes total)
**Impact:** [Number of affected users, features unavailable]

### Timeline
- HH:MM — [Event, detection, or action]
- HH:MM — [Next event]

### Root Cause
[What specifically caused the incident]

### Resolution
[What was done to fix it]

### Action Items
- [ ] [Preventive measure 1]
- [ ] [Preventive measure 2]

### Lessons Learned
[What went well, what could improve]
```
