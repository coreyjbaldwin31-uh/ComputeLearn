---
name: "ci-sync"
description: "Align CI behavior with local repo reality. Use when: local commands and pipeline commands drift apart, when CI is missing, or when quality gates need to reflect actual project scripts. Keywords: CI, pipeline, workflow, GitHub Actions, drift, parity, quality gate, sync, local, build, lint, test."
---

# CI Sync

Align CI pipeline definitions with the actual local commands so what passes locally passes in CI, and vice versa.

## When to Use

- CI is missing or incomplete for the project
- CI runs commands that no longer exist or differ from local scripts
- Local scripts were added or changed but CI was not updated
- A PR fails in CI but passes locally (or the reverse)
- After a dependency or toolchain change that affects build/test/lint commands
- Before a release to confirm CI gates match local verification

## Required Context

1. **Read `PRD.md`** if it exists — understand project requirements and quality expectations.
2. **Read `README.md`** if it exists — identify documented verification commands.
3. **Read `package.json` scripts** — the authoritative source for local commands.
4. **Read `.github/workflows/`** or equivalent CI config — current pipeline definitions.
5. Do not create `docs/plan.md` or any duplicate primary planning document.

## Procedure

### Step 1 — Inventory Local Commands

Determine the canonical local commands from `package.json` scripts and actual usage:

| Purpose | Typical Script | Example Command |
|---------|---------------|-----------------|
| Install | `npm ci` | `npm ci` |
| TypeScript compile | `typecheck` | `npx tsc --noEmit` |
| Lint | `lint` | `npm run lint` |
| Unit tests | `test` | `npx vitest run` |
| Build | `build` | `npm run build` |
| Full verify | `verify` | `npm run verify` |
| Docker build | `docker:build` | `docker build --file Dockerfile --tag app:ci .` |
| Format check | `format:check` | `npx prettier --check .` |

Record each command that exists and works locally. Do not invent commands that are not proven.

### Step 2 — Inventory CI Steps

Read each workflow file and extract:

| Field | What to Record |
|-------|---------------|
| **Trigger** | push, pull_request, schedule, manual |
| **Branches** | Which branches trigger the workflow |
| **Jobs** | Job names and their purposes |
| **Steps** | Exact commands each job runs |
| **Node/runtime version** | What version CI uses |
| **Caching** | What is cached (node_modules, .next, etc.) |
| **Secrets** | What secrets are referenced |
| **Services** | Service containers (database, cache, etc.) |
| **Artifacts** | What is uploaded or downloaded between jobs |
| **Concurrency** | Concurrency groups or cancel-in-progress |

### Step 3 — Compare and Find Drift

For each local command, check whether CI runs the same command:

| Local Command | CI Equivalent | Status |
|--------------|--------------|--------|
| `npm ci` | `npm ci` | aligned / drifted / missing |
| `npx tsc --noEmit` | ... | aligned / drifted / missing |
| `npm run lint` | ... | aligned / drifted / missing |
| `npx vitest run` | ... | aligned / drifted / missing |
| `npm run build` | ... | aligned / drifted / missing |
| `docker build ...` | ... | aligned / drifted / missing / n/a |

Common drift patterns:

| Drift | Example | Fix |
|-------|---------|-----|
| **Command mismatch** | Local runs `npm run lint`, CI runs `eslint .` directly | Use the same script |
| **Missing step** | Local has `typecheck`, CI skips it | Add the step |
| **Extra step** | CI runs a command that doesn't exist locally | Remove or add it locally |
| **Version mismatch** | Local uses Node 22, CI uses Node 20 | Align versions |
| **Order mismatch** | CI runs tests before typecheck | Match local order |
| **Stale step** | CI references a removed script | Remove the step |

### Step 4 — Design Job Structure

Organize CI jobs for clarity and speed:

| Job | Purpose | Commands | Runs When |
|-----|---------|----------|-----------|
| **quality** | Fast feedback | install, typecheck, lint | Every push and PR |
| **test** | Correctness | install, test suite | Every push and PR |
| **build** | Deployability | install, build | Every push and PR |
| **docker** | Container validity | docker build | PRs to main, or when Dockerfile changes |

Principles:

- **Separate fast from slow** — lint and typecheck should not wait for Docker build
- **Use `needs:`** to express real dependencies between jobs
- **Cache aggressively** — `node_modules`, build cache, Docker layers
- **Fail fast** — run cheap checks first
- **Match local** — every CI command should be runnable locally

### Step 5 — Create or Update Workflow Files

When creating or updating `.github/workflows/*.yml`:

- Use the repo's actual package manager (`npm ci`, not `yarn install` if the repo uses npm)
- Pin the Node version to match `package.json` engines and `.nvmrc`
- Use `actions/setup-node` with `cache: 'npm'` (or appropriate manager)
- Reference `package.json` scripts, not raw tool commands
- Add concurrency groups for PRs to avoid redundant runs
- Do not hardcode secrets in workflow files — use `${{ secrets.NAME }}`

Template structure:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'  # or hardcode version
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npx vitest run

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

Adapt to the actual project. Remove jobs for tools that do not exist. Add jobs for tools that do.

### Step 6 — Document Secrets and Environment

List every secret and environment variable CI needs:

| Variable | Source | Purpose |
|----------|--------|---------|
| `NODE_AUTH_TOKEN` | GitHub secret | Private registry access (if needed) |
| ... | ... | ... |

If no secrets are needed, state that explicitly.

### Step 7 — Update README.md

Add or update a CI section when:

- CI workflow was created or significantly changed
- Local-to-CI parity information helps contributors
- Workflow triggers or branch rules changed

Typical README CI section:

```markdown
## CI

Pushes and PRs to `main` run quality, test, and build checks via GitHub Actions.

To match CI locally:
npm ci
npx tsc --noEmit
npm run lint
npx vitest run
npm run build
```

### Step 8 — Optional: docs/ci-cd.md

Create or update if:

- The pipeline has non-obvious structure (matrix builds, deployment stages)
- Secrets or service containers need explanation
- Contributors need to understand CI failure patterns

Skip if the workflow is simple and self-explanatory.

## Output Format

```
## CI Parity Status

### Local Commands
| Purpose | Command | Works Locally |
|---------|---------|--------------|
| ... | ... | yes/no |

### CI Drift
| Local Command | CI Equivalent | Status |
|--------------|--------------|--------|
| ... | ... | aligned / drifted / missing |

### Workflow Changes
- [file — what was created or updated and why]

### Secrets Required
- [list or "none"]

### README Updated
- [what changed, or "no changes needed"]

### Validation
| Check | Command | Result |
|-------|---------|--------|
| Local verify | `npm run verify` | pass/fail |
| Workflow lint | `actionlint` (if available) | pass/fail/n/a |

### Remaining Drift
- [any parity gaps that still need attention, or "none"]
```

## Rules

- Do not hardcode secrets in workflow files. Use GitHub secrets or environment variable references.
- Do not create CI steps for commands that are not proven to work locally. Every CI step must be runnable on a dev machine.
- Do not add unnecessary complexity. Prefer clear, maintainable workflows over clever optimizations.
- Do not duplicate steps across jobs when a shared setup action or reusable workflow would be cleaner.
- Prefer `package.json` script references over raw tool commands in CI.
- End with a section titled **"CI Parity Status"** showing the alignment between local and CI commands.
