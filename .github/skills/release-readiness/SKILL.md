---
name: "release-readiness"
description: "Evaluate whether the repo is genuinely ready to ship and prepare the release checklist. Use when: near a release candidate, deployment milestone, or any handoff where operational readiness matters. Keywords: release, readiness, ship, deploy, checklist, blocker, rollback, go no-go, milestone, candidate."
---

# Release Readiness

Evaluate whether the repository is genuinely ready to ship. Produce a clear go/no-go recommendation backed by evidence.

## When to Use

- Before tagging a release candidate
- Before deploying to staging or production
- At a project milestone or handoff point
- After a hardening pass to confirm completeness
- When a stakeholder asks "are we ready to ship?"

## Required Context

1. **Read `PRD.md`** if it exists — understand acceptance criteria, task status, and release-blocking requirements.
2. **Read `README.md`** if it exists — confirm setup, run, and verify instructions are operational.
3. **Read `package.json`** — confirm version, scripts, and dependencies.
4. **Read `docs/release.md`** and `docs/deployment.md`** if they exist.
5. **Read `.github/workflows/`** — confirm CI health.
6. Do not create `docs/plan.md` or any duplicate primary planning document.

## Procedure

### Step 1 — Scope Review

Compare implemented scope against PRD.md:

| PRD Item | Status | Evidence |
|----------|--------|----------|
| [requirement or task] | done / partial / not started | [what proves it] |

Classify scope completeness:

- **Full scope** — all PRD items for this release are complete
- **Reduced scope** — some items deferred with documented rationale
- **Incomplete** — critical items remain unfinished

Flag any PRD acceptance criterion that is not met.

### Step 2 — Verification Status

Run or review recent results from the full validation matrix:

| Check | Command | Last Result | Current |
|-------|---------|-------------|---------|
| Install | `npm ci` | ... | pass/fail/not run |
| TypeScript | `npx tsc --noEmit` | ... | pass/fail/not run |
| Lint | `npm run lint` | ... | pass/fail/not run |
| Tests | `npx vitest run` | ... | pass/fail/not run |
| Build | `npm run build` | ... | pass/fail/not run |
| Full verify | `npm run verify` | ... | pass/fail/not run |
| Docker build | `docker build ...` | ... | pass/fail/n/a |
| App startup | `npm start` | ... | pass/fail/not run |

If any check has not been run recently, run it now. Do not assume prior results are still valid.

### Step 3 — Blocker Assessment

Identify and classify open issues:

| Category | Issue | Severity | Blocks Release? |
|----------|-------|----------|----------------|
| Failing test | [description] | critical / minor | yes / no |
| Build error | [description] | critical | yes |
| Missing feature | [description] | critical / deferrable | yes / no |
| Documentation gap | [description] | minor | no |
| Security concern | [description] | critical / minor | yes / no |
| Performance issue | [description] | minor / critical | depends |

Separate cleanly:

- **Release blockers** — must be resolved before shipping
- **Should-fix** — important but can ship without
- **Polish** — nice to have, no release impact

### Step 4 — Documentation Readiness

Verify each documentation surface:

| Doc | Status | Issue |
|-----|--------|-------|
| README.md | accurate / stale / missing sections | [detail] |
| PRD.md | current / outdated task status | [detail] |
| CONTRIBUTING.md | accurate / stale / missing | [detail] |
| API docs | accurate / stale / n/a | [detail] |
| Environment docs | accurate / stale / n/a | [detail] |
| Deployment docs | accurate / stale / missing | [detail] |

Stale README or missing deployment docs may be release blockers if they affect operators or contributors.

### Step 5 — Environment and Secrets

Confirm environment readiness:

- [ ] `.env.example` lists all required variables
- [ ] No secrets are hardcoded in source
- [ ] Environment variables match between local, CI, and deployment target
- [ ] Runtime version is pinned and consistent across all environments
- [ ] Database migrations are up to date (if applicable)
- [ ] External service dependencies are documented

### Step 6 — Deployment Readiness

Evaluate deployment prerequisites:

| Element | Status | Notes |
|---------|--------|-------|
| **Deploy target** | configured / missing / unclear | [what and where] |
| **Deploy command** | documented / missing | [exact command] |
| **Version strategy** | semver / tag / none | [current version] |
| **Changelog** | current / stale / missing | [last entry] |
| **CI deploy job** | present / missing / n/a | [workflow file] |
| **Health endpoint** | present / missing / n/a | [URL] |

### Step 7 — Rollback Readiness

Confirm rollback capability:

| Element | Status |
|---------|--------|
| **Rollback command** | documented / missing |
| **Previous version available** | yes / no / n/a |
| **Data migration reversible** | yes / no / n/a |
| **Rollback tested** | yes / no |
| **Recovery time estimate** | [duration or unknown] |

If rollback is not possible or not documented, flag as a release blocker.

### Step 8 — CI Health

Confirm CI pipeline status:

- [ ] CI workflow exists and runs on the release branch
- [ ] All CI jobs pass on the current commit
- [ ] CI commands match local verification commands
- [ ] No skipped or disabled quality gates
- [ ] Required branch protections are active (if applicable)

### Step 9 — Release Artifacts

Prepare or verify:

- [ ] Version bumped (if applicable)
- [ ] Changelog or release notes drafted
- [ ] `docs/release.md` created or updated
- [ ] `docs/deployment.md` created or updated
- [ ] PR description complete (if merging via PR)
- [ ] Git tag ready (if using tags)

## Output Format

```
## Release Readiness Report

### Scope
- PRD coverage: [full | reduced | incomplete]
- Unmet acceptance criteria: [list or "none"]

### Verification
| Check | Result |
|-------|--------|
| Install | pass/fail |
| TypeScript | pass/fail |
| Lint | pass/fail |
| Tests | pass/fail |
| Build | pass/fail |
| Docker | pass/fail/n/a |

### Release Blockers
- [list each blocker with severity and what must be done — or "None"]

### Should-Fix
- [list or "None"]

### Polish
- [list or "None"]

### Documentation
- README.md: [accurate / needs update]
- PRD.md: [current / needs update]
- Deployment docs: [present / missing]

### Environment
- Secrets check: [clean / issues found]
- Env parity: [aligned / drifted]

### Deployment
- Target: [description]
- Deploy command: [command or "not documented"]
- Rollback: [command or "not documented"]

### CI
- Pipeline: [passing / failing / missing]
- Parity: [aligned / drifted]

### Go / No-Go

**[GO — ready to ship]** / **[NO-GO — blockers remain]**

Reasons:
- [bullet list of key reasons for the decision]

Recommended next steps:
- [what should happen next — ship, fix blockers, run hardening, etc.]
```

## Rules

- Do not declare readiness when key prerequisites are missing. Be honest about gaps.
- Separate release blockers from minor polish. Do not let polish items block a release, and do not let blockers be dismissed as polish.
- Prefer operational clarity over optimistic language. "Tests pass" is better than "looking good."
- Do not assume prior verification results are current. Re-run or explicitly state when checks were last run.
- Do not skip rollback planning. Missing rollback documentation is a release blocker.
- End with a section titled **"Go / No-Go"** containing the decision, reasons, and recommended next steps.
