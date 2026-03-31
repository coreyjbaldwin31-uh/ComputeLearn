---
name: "verify-full"
description: "Run the broad validation matrix before a major checkpoint, hardening pass, release candidate, or final stop point. Use when: full-repo confidence is needed, not just local-change confidence. Keywords: verify, validate, full, matrix, build, typecheck, lint, test, Docker, CI parity, release gate, hardening, acceptance criteria."
---

# Full Verification

Run every relevant validation check across the repository to establish broad confidence before a major checkpoint.

## When to Use

- Before a hardening pass or release candidate
- Before merging a large PR or feature branch
- After a dependency upgrade or toolchain change
- Before documentation sync or PRD progress updates
- When `verify-fast` is insufficient because the change scope is broad
- Whenever you need repo-wide confidence, not just local confidence

## Required Context

1. **Read `PRD.md`** if it exists — identify acceptance criteria and release-blocking requirements.
2. **Read `README.md`** if it exists — identify documented validation commands.
3. **Read `package.json` scripts** — identify the actual available check commands.
4. Do not create `docs/plan.md` or any duplicate primary planning document.

## Procedure

### Step 1 — Build the Validation Matrix

Determine which checks apply to this repo based on what exists:

| Check | Applies When | Typical Command |
|-------|-------------|-----------------|
| **Install** | `package.json` or equivalent exists | `npm ci` or `npm install` |
| **TypeScript compile** | `tsconfig.json` exists | `npx tsc --noEmit` |
| **Lint** | Lint config exists | `npm run lint` |
| **Unit tests** | Test files exist | `npx vitest run` |
| **Integration tests** | Integration test files or config exist | Framework-specific command |
| **Build** | Build script exists | `npm run build` |
| **Full verify script** | `verify` script in `package.json` | `npm run verify` |
| **Docker build** | `Dockerfile` exists | `docker build --file Dockerfile --tag computelearn:verify .` |
| **Docker Compose up** | `docker-compose.yml` exists | `docker compose up --build -d` then health check |
| **App startup** | Start script exists | `npm start` or `npm run dev` with timeout |
| **API health** | API routes exist | `curl` or equivalent against health endpoint |
| **Migration check** | Database migrations exist | Migration dry-run or status command |
| **Seed check** | Seed scripts exist | Seed dry-run or validation |
| **CI parity** | `.github/workflows/` exist | Run the same commands CI runs, in order |

Mark each check as: **applicable** or **not applicable** for this repo.

### Step 2 — Run the Checks

Execute each applicable check in dependency order:

1. **Install** — dependencies must be current before anything else
2. **TypeScript compile** — type errors block everything downstream
3. **Lint** — style and pattern violations
4. **Unit tests** — core logic correctness
5. **Integration tests** — cross-module correctness
6. **Build** — production build succeeds
7. **Full verify script** — runs the repo's own composite check
8. **Docker build** — container image builds cleanly
9. **Docker Compose** — multi-service stack boots
10. **App startup** — application starts without crash
11. **API / UI health** — key endpoints respond
12. **Migration / seed** — data layer is consistent
13. **CI parity** — local results match what CI would run

For each check, record:

- **Command**: exact command executed
- **Result**: pass | fail | flaky | skipped | not applicable | not run
- **Duration**: approximate execution time
- **Notes**: error summary if failed, reason if skipped

### Step 3 — Compare Against PRD and README

#### PRD.md Acceptance Criteria

- Read PRD.md acceptance criteria and gate definitions.
- For each criterion, determine whether current validation evidence satisfies it.
- Flag any acceptance criterion that is not covered by any check.

#### README.md Verification Instructions

- Compare documented verification steps against what was actually run.
- Flag stale commands (documented but no longer exist).
- Flag missing documentation (commands exist but are not documented).
- Flag wrong commands (documented command differs from actual).

### Step 4 — Classify Results

Separate results into severity tiers:

| Tier | Definition | Examples |
|------|-----------|----------|
| **Release-blocking** | Must be fixed before merge or ship | Build failure, test failure, type error, Docker build failure |
| **Should-fix** | Should be fixed but does not block release | Lint warnings, flaky tests, minor doc drift |
| **Advisory** | Worth noting but not actionable now | Skipped checks, coverage gaps, performance notes |

### Step 5 — Determine Readiness

Based on the full matrix, recommend one of:

| Readiness Level | Criteria | Recommended Next Step |
|----------------|----------|----------------------|
| **Ready for release** | All checks pass, no blockers, acceptance criteria met | → `release-deployment-agent` |
| **Ready for hardening** | Core checks pass, minor issues remain | → `refactorer` or `test-specialist` |
| **Ready for docs sync** | Code is stable, documentation needs updating | → `docs-pr-writer` |
| **Needs implementation** | Failing tests or build errors | → `implementer` or `test-specialist` |
| **Needs investigation** | Unclear failures or flaky results | → `planner` to assess scope |

## Output Format

```
## Full Verification Report

### Validation Matrix
| # | Check | Command | Result | Duration | Notes |
|---|-------|---------|--------|----------|-------|
| 1 | Install | `npm ci` | pass | ... | |
| 2 | TypeScript | `npx tsc --noEmit` | pass | ... | |
| ... | ... | ... | ... | ... | ... |

### Summary
- Passed: X
- Failed: X
- Flaky: X
- Skipped: X
- Not applicable: X

### Release-Blocking Issues
[List each blocking failure with command, error, and location — or "None"]

### Should-Fix Issues
[List or "None"]

### Advisory Notes
[List or "None"]

### PRD Acceptance Criteria
| Criterion | Covered By | Status |
|-----------|-----------|--------|
| ... | ... | met / not met / partial |

### README Drift
[Mismatches between documented and actual validation — or "None detected"]

### Overall Readiness
**[Ready for release | Ready for hardening | Ready for docs sync | Needs implementation | Needs investigation]**

Confidence: [high | medium | low] — based on how many checks were actually run vs skipped.

Recommended next step: [agent or skill name and why]
```

## Rules

- Do not compress failures into vague summaries. Report exact commands, exact errors, exact locations.
- Do not mark the repo healthy if broad checks were not actually run. Distinguish "passed" from "not run."
- Do not skip checks silently. Every applicable check must be run or explicitly marked as skipped with a reason.
- Do not invent check results. Run the command and report what happened.
- Distinguish confidence level: high (all applicable checks run and passed), medium (most run, minor skips), low (significant checks skipped or flaky).
- End with a section titled **"Overall Readiness"** containing the readiness level, confidence, and recommended next step.
