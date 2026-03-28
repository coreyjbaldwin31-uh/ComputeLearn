---
name: "docs-sync"
description: "Keep PRD.md, README.md, and supporting docs aligned with actual repository behavior. Use when: after implementation, config changes, environment changes, workflow changes, or release preparation. Keywords: docs, sync, documentation, drift, README, PRD, update, stale, align."
---

# Documentation Sync

Align project documentation with actual repository behavior. Remove stale content, fill gaps, and ensure every documented command works.

## When to Use

- After completing an implementation task or feature
- After changing configuration, environment, or dependencies
- After changing build, test, or deployment workflows
- Before or after a release preparation pass
- When `verify-fast` or `verify-full` flagged README or PRD drift
- When a contributor reports that documented steps do not work

## Required Context

1. **Read `PRD.md`** if it exists — understand current goals, task status, and acceptance criteria.
2. **Read `README.md`** if it exists — understand documented setup, run, test, and verify instructions.
3. **Read `package.json` scripts** — identify actual available commands.
4. Do not create `docs/plan.md` or any duplicate primary planning document.

## Procedure

### Step 1 — Gather Repo Reality

Collect facts from the repository:

- **`package.json`** — scripts, dependencies, engines, name, version
- **`tsconfig.json`** — TypeScript configuration and target
- **`Dockerfile`** / `docker-compose.yml` — container configuration
- **`.github/workflows/`** — CI/CD commands and order
- **`app/`** / `src/`** / `lib/`** — actual project structure and entrypoints
- **`.env.example`** or equivalent — environment variable expectations
- **`vitest.config.ts`** / `jest.config.*` — test framework configuration
- **`git log --oneline -10`** — recent changes that may affect docs

Record what actually exists and works. Do not assume.

### Step 2 — Audit PRD.md

Compare PRD.md against repo reality. For each section, check:

| PRD Section          | Check                                        |
| -------------------- | -------------------------------------------- |
| Goals / vision       | Still accurate?                              |
| Task list / progress | Status markers match implementation?         |
| Remaining work       | Items still valid and correctly prioritized? |
| Acceptance criteria  | Achievable with current implementation?      |
| Risks                | Any new risks? Any resolved?                 |
| Assumptions          | Any invalidated by implementation?           |
| Constraints          | Any changed?                                 |
| Sequencing           | Still correct given completed work?          |

**Update rules for PRD.md:**

- Mark completed tasks as done with brief evidence
- Remove or reword tasks that are no longer relevant
- Add new risks discovered during implementation
- Resolve risks that are no longer applicable
- Update sequencing if implementation order changed
- Do not change product vision unless the user explicitly requests it

### Step 3 — Audit README.md

Compare README.md against repo reality. For each section, check:

| README Section      | Check                                              |
| ------------------- | -------------------------------------------------- |
| Project description | Still accurate?                                    |
| Prerequisites       | Runtime versions, tools match actual requirements? |
| Install             | Command works?                                     |
| Run / start         | Command works?                                     |
| Test / verify       | Commands work and match `package.json` scripts?    |
| Build               | Command works?                                     |
| Docker              | Commands work and images build?                    |
| Project structure   | Folders and files still match?                     |
| Contributing        | Workflow still accurate?                           |
| Environment         | Variables and config still match `.env.example`?   |

**Update rules for README.md:**

- Fix commands that no longer work
- Add commands that were introduced but not documented
- Remove references to features, scripts, or files that no longer exist
- Update project structure if folders were added, renamed, or removed
- Keep the existing tone and format consistent
- Verify every command you write by checking `package.json` scripts or the filesystem

### Step 4 — Audit Supporting Docs

Check each existing supporting doc for staleness:

| Doc                    | Check When                                       |
| ---------------------- | ------------------------------------------------ |
| `docs/architecture.md` | Project structure or module boundaries changed   |
| `docs/environment.md`  | Environment setup or variables changed           |
| `docs/database.md`     | Schema, migrations, or data layer changed        |
| `docs/testing.md`      | Test strategy, framework, or conventions changed |
| `docs/ci-cd.md`        | CI/CD pipeline or workflow changed               |
| `docs/deployment.md`   | Deploy target, process, or config changed        |
| `docs/release.md`      | Release process or versioning changed            |
| `CONTRIBUTING.md`      | Contributor workflow changed                     |

**Rules for supporting docs:**

- Only update docs that exist and are affected
- Do not create new doc files unless they clearly reduce repeated confusion
- Remove content that references removed features or old workflows
- Keep each doc focused on its topic

### Step 5 — Remove Stale Content

Actively look for and remove:

- Commands that reference deleted scripts
- References to files or folders that no longer exist
- Placeholder text that was never filled in (e.g., "TODO: add this section")
- Duplicate instructions that appear in multiple docs
- Version numbers or dates that are wrong
- Links to pages or resources that no longer exist

### Step 6 — Produce Drift Summary

Document every discrepancy found, whether fixed or not:

- What was stale and what was corrected
- What was missing and what was added
- What could not be fixed (needs user input or implementation first)
- What was accurate and left unchanged

## Output Format

```
## Docs Updated

### PRD.md
- [what was updated and why, or "no changes needed"]

### README.md
- [what was updated and why, or "no changes needed"]

### Supporting Docs
- [file — what was updated, or "no supporting docs needed updating"]

### Stale Content Removed
- [what was removed and from where, or "none"]

### Drift Found but Not Fixed
- [issues that need user input or implementation before they can be documented]

### Remaining Documentation Gaps
- [known gaps that still need attention]
```

## Rules

- Do not document features that do not exist. Every documented behavior must be verifiable.
- Do not preserve stale instructions for completeness. Stale docs are worse than missing docs.
- Do not add generic filler prose. Keep documentation specific and practical.
- Keep README.md runnable — every command must work.
- Keep PRD.md operational — task status must match reality.
- Prefer short, accurate documentation over comprehensive but bloated documentation.
- End with a section titled **"Docs Updated"** listing every file touched and why.
