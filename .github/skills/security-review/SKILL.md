---
name: "security-review"
description: "Perform a focused repository security pass. Use when: after meaningful implementation, before release candidates, or when auth, secrets, external input, or privileged actions are involved. Keywords: security, review, audit, vulnerability, auth, secrets, injection, XSS, CSRF, OWASP, input validation, exposure, container security, permissions."
---

# Security Review

Perform a practical, evidence-based security pass of the repository. Find real issues, rank them, and fix what is safe to fix immediately.

## When to Use

- After implementing authentication, authorization, or secret handling
- Before a release candidate or deployment milestone
- After adding external input handling (forms, APIs, file uploads)
- After adding container, CI, or environment configuration
- When `verify-full` or `release-readiness` flags a security concern
- When a dependency audit reveals known vulnerabilities

## Required Context

1. **Read `PRD.md`** if it exists — understand security-relevant requirements and constraints.
2. **Read `README.md`** if it exists — understand setup, secrets handling, and environment instructions.
3. **Read `.env.example`** — understand expected environment variables and secret boundaries.
4. **Read `package.json`** — identify dependencies with known security implications.
5. **Read `Dockerfile`** and `docker-compose.yml`** — check container security posture.
6. Do not create `docs/plan.md` or any duplicate primary planning document.

## Procedure

### Step 1 — Secret Handling

Check every location where secrets could leak:

| Check | What to Look For |
|-------|-----------------|
| Committed secrets | API keys, tokens, passwords in source files |
| `.env` in git | `.env` not in `.gitignore` |
| Hardcoded credentials | Strings that look like passwords or tokens in code |
| Secret logging | Secrets printed to console, logs, or error messages |
| Client exposure | Server secrets sent to browser (in SSR props, API responses) |
| CI secrets | Secrets referenced but not using `${{ secrets.* }}` syntax |

Run a targeted search:

```
grep -rni "password\|secret\|api_key\|token\|auth" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.yml" --include="*.yaml" --include="*.json" .
```

Exclude `.env.example` (expected to have placeholder values) and `node_modules`.

### Step 2 — Input Validation

Check every boundary where external data enters the system:

| Boundary | Check |
|----------|-------|
| API route handlers | Is input validated before use? |
| Form inputs | Are values sanitized? Length-limited? |
| URL parameters | Are they validated against expected patterns? |
| File uploads | Are type, size, and name validated? |
| Database queries | Are parameterized queries used (no string concatenation)? |
| Command execution | Is user input ever passed to `exec`, `spawn`, or `eval`? |
| JSON parsing | Is `JSON.parse` wrapped in try/catch at boundaries? |

Flag any location where external input reaches a sensitive operation without validation.

### Step 3 — Output Encoding

Check where data is rendered or returned:

| Context | Check |
|---------|-------|
| HTML rendering | Is user-supplied content escaped? (React JSX auto-escapes, but `dangerouslySetInnerHTML` does not) |
| API responses | Do error messages leak stack traces, file paths, or internal state? |
| Logs | Do logs include user PII, tokens, or request bodies with secrets? |
| Headers | Are security headers set (CSP, X-Frame-Options, etc.)? |

### Step 4 — Authentication and Authorization

If the app has auth:

| Check | What to Verify |
|-------|---------------|
| Auth bypass | Can protected routes be accessed without credentials? |
| Privilege escalation | Can a regular user access admin endpoints? |
| Session handling | Are sessions invalidated on logout? Timeout set? |
| Token storage | Are tokens stored securely (httpOnly cookies, not localStorage for sensitive tokens)? |
| CSRF protection | Are state-changing requests protected against CSRF? |

If the app has no auth, note this explicitly — it may be by design or may be a gap.

### Step 5 — Configuration and Defaults

Check for unsafe defaults:

| Check | What to Look For |
|-------|-----------------|
| Debug mode | `NODE_ENV=development` in production config |
| CORS | Overly permissive CORS (`*` origin) |
| Rate limiting | No rate limiting on public endpoints |
| Error detail | Detailed errors shown in production |
| Default credentials | Default admin/admin or similar |
| Open ports | Container exposing unnecessary ports |

### Step 6 — Container Security

If Docker is used:

| Check | What to Verify |
|-------|---------------|
| Base image | Is it pinned to a specific version (not `latest`)? |
| Root user | Does the container run as non-root in production? |
| Secrets in image | Are secrets baked into the image (not passed via env)? |
| .dockerignore | Does it exclude `.env`, `.git`, `node_modules`? |
| Exposed ports | Only necessary ports exposed? |
| Build args | No secrets passed as build args (visible in image layers)? |

### Step 7 — Dependency Posture

Practical dependency checks:

```
npm audit
```

Review results and classify:

| Severity | Action |
|----------|--------|
| Critical / High | Flag as release blocker if exploitable in this context |
| Moderate | Flag as should-fix |
| Low / Info | Note but do not block |

Do not flag every advisory — only those relevant to how the dependency is used in this project.

### Step 8 — Immediate Remediations

Fix issues that are safe to fix now:

- Add missing `.gitignore` entries for secret files
- Remove accidentally committed secrets (and recommend rotating them)
- Add `.env` to `.dockerignore`
- Fix obvious `dangerouslySetInnerHTML` with user input
- Add missing error boundaries that leak stack traces

Do not make changes that could break functionality. Flag those for the implementer instead.

### Step 9 — Documentation Updates

Update when security-relevant guidance changed:

- **README.md** — when secret handling, environment setup, or security-sensitive practices need clarification
- **`docs/security-review.md`** — when the review produced findings worth preserving for future contributors

## Output Format

```
## Security Readiness

### Findings
| # | Severity | Category | Finding | Location | Status |
|---|----------|----------|---------|----------|--------|
| 1 | high | secrets | ... | file:line | open / fixed |
| 2 | medium | input | ... | file:line | open / fixed |
| ... | ... | ... | ... | ... | ... |

### Summary
- High: X (Y fixed)
- Medium: X (Y fixed)
- Low: X (Y fixed)

### Immediate Remediations Applied
- [what was fixed and where — or "None"]

### Open Issues Requiring Implementation
- [issues that need developer action, with recommended approach]

### Dependency Audit
- Critical/High: X
- Moderate: X
- Low: X
- Relevant to this project: [list or "none identified"]

### Documentation Updated
- [files updated — or "no updates needed"]

### Security Readiness
**[Clean — no high-severity findings | Conditional — high findings fixed, medium remain | Blocked — unresolved high-severity issues]**

Recommended next step: [fix blockers → implementer | proceed to release → release-readiness | deeper review needed → security-reviewer agent]
```

## Rules

- Do not fabricate vulnerabilities. Every finding must cite a specific file, line, or configuration.
- Do not leak secrets in the review output. Redact values, show only the variable name or pattern.
- Do not flag theoretical issues with no evidence in the repo. Focus on what is actually present.
- Prefer secure defaults and least privilege. When in doubt, recommend the more restrictive option.
- Keep findings actionable. Every finding should include what to do about it.
- Do not perform broad dependency upgrades as part of a security review. Flag, do not fix.
- End with a section titled **"Security Readiness"** containing the overall posture and recommended next step.
