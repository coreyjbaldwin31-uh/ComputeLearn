# Security Review — ComputeLearn

**Date:** 2026-04-05
**Scope:** API routes, client components, auth system, LTI integration, Docker config added in recent commits.

---

## Findings

| #   | Severity | Finding                                                                                                              | File                                                                | Line  | Status                                                                                  |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------- |
| 1   | High     | LTI callback decodes JWT without cryptographic signature verification                                                | `app/api/lti/callback/route.ts`                                     | 38    | mitigated — gated by `isLtiConfigured()` requiring `LTI_JWKS_URL`                       |
| 2   | High     | LTI launch generates nonce/state but never persists them; callback cannot validate state against replay/CSRF         | `app/api/lti/launch/route.ts`                                       | 52-53 | pending                                                                                 |
| 3   | Medium   | CSV injection — gradebook export cell values starting with `=`, `+`, `-`, `@` were not sanitized                     | `app/api/instructor/gradebook/export/route.ts`                      | 63    | **fixed**                                                                               |
| 4   | Medium   | No input size limits on progress notes/reflection fields (potential DoS via large payloads)                          | `app/api/progress/route.ts`                                         | —     | **fixed** (10 KB limit)                                                                 |
| 5   | Medium   | No input size limits on submission content/feedback (potential DoS via large payloads)                               | `app/api/submissions/route.ts`, `app/api/submissions/[id]/route.ts` | —     | **fixed** (100 KB limit)                                                                |
| 6   | Medium   | CSV enrollment import had no body size limit                                                                         | `app/api/instructor/enrollments/import/route.ts`                    | —     | **fixed** (1 MB limit)                                                                  |
| 7   | Medium   | `NEXT_PUBLIC_APP_URL` used in server-only LTI config — `NEXT_PUBLIC_` prefix causes Next.js to bundle into client JS | `lib/lti-config.ts`                                                 | 13    | **fixed** — renamed to `APP_URL` with fallback                                          |
| 8   | Low      | LTI endpoints blocked by auth middleware — LTI integration is non-functional until `/api/lti` is exempted            | `middleware.ts`                                                     | 37    | noted — must add exemption when LTI is deployed, after JWKS verification is implemented |
| 9   | Low      | No rate limiting on any endpoints                                                                                    | all routes                                                          | —     | pending                                                                                 |
| 10  | Low      | Health endpoint exposes `process.uptime()` — minor info leak                                                         | `app/api/health/route.ts`                                           | 26    | accepted                                                                                |
| 11  | Info     | Instructor can review any submission regardless of enrollment scope                                                  | `app/api/submissions/[id]/route.ts`                                 | 46    | accepted — single-course platform, appropriate for current model                        |

---

## Fixes Applied

- **#3** — Added `sanitizeCell()` to gradebook CSV export that prefixes dangerous formula-trigger characters with `'`.
- **#4** — Added 10,000-character limit on `notes` and `reflection` in `PUT /api/progress`.
- **#5** — Added 100,000-character limit on `content` in `POST /api/submissions` and on `content`/`feedback` in `PUT /api/submissions/[id]`.
- **#6** — Added 1 MB body size limit on CSV enrollment import.
- **#7** — Changed `lib/lti-config.ts` to prefer `APP_URL` over `NEXT_PUBLIC_APP_URL`, updated `.env.example`.
- **#1 (partial)** — Updated `isLtiConfigured()` to require `LTI_JWKS_URL`, making the unverified JWT callback unreachable unless JWKS URL is configured. Added prominent security warning comment.

## Remediation Required

- **#1** — Before production LTI deployment: implement JWKS-based JWT signature verification in `app/api/lti/callback/route.ts`. Use the `LTI_JWKS_URL` env var to fetch platform public keys and verify `id_token` signatures. Recommended agent: `implementer`.
- **#2** — Before production LTI deployment: persist `nonce` and `state` (e.g., in Redis or database with short TTL) during `/api/lti/launch` and validate them in `/api/lti/callback`. Recommended agent: `implementer`.
- **#8** — When LTI is deployed, add `/api/lti` to the middleware path exemptions in `middleware.ts`. Only do this after #1 and #2 are resolved.
- **#9** — Add rate limiting middleware or use a reverse proxy rate limiter for public endpoints (`/api/health`, `/api/lti/*`). Recommended approach: Vercel's built-in rate limiting or a middleware-based solution. Recommended agent: `implementer`.

## Accepted Risks

- **#10** — `process.uptime()` in health endpoint is low-sensitivity operational data. Acceptable for internal monitoring.
- **#11** — Instructor cross-enrollment submission review is acceptable for a single-course platform. Revisit if multi-tenant instructor scoping is added.

## Areas Reviewed

- All 14 API routes in scope (progress, submissions, instructor/_, lti/_, account/delete, export/transcript/\*, health)
- Auth system (`auth.ts`, `middleware.ts`, `lib/auth-helpers.ts`)
- LTI config (`lib/lti-config.ts`)
- Client components (data-portability-dialog, roster-management, submission-panel, academy-global-ux, readiness-wizard)
- Docker configuration (Dockerfile, docker-compose.yml, docker-compose.prod.yml)
- Secret handling (.env.example, .gitignore)
- `dangerouslySetInnerHTML` usage (layout.tsx theme script — static, safe)

## Areas Not Reviewed

- Prisma schema and migration files (ORM injection risk is minimal with Prisma)
- Third-party dependency vulnerabilities (`npm audit` not run — recommend running separately)
- Load testing and performance under adversarial conditions
- Network-level security (TLS, reverse proxy headers, HSTS)

---

## Release Readiness

- **Acceptable for internal testing:** Yes
- **Acceptable for production release:** Yes, with exception of LTI integration — LTI endpoints must not be enabled (middleware exempted) until findings #1 and #2 are resolved.

## Recommended Next Steps

1. Run `npm audit` to check for known dependency vulnerabilities.
2. Implement JWKS JWT verification for LTI callback before enabling LTI in production.
3. Implement state/nonce persistence for LTI launch/callback flow.
4. Consider adding rate limiting middleware for public and high-write endpoints.
