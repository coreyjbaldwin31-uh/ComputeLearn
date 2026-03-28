---
name: "verify-fast"
description: "Run the narrowest useful validation after a small change. Use when: after focused edits, small feature steps, bug fixes, or config changes to stay fast and disciplined. Keywords: verify, validate, fast, quick check, lint, typecheck, test, build, smoke test, targeted."
---

# Fast Verification

Run the minimum effective validation for a small change. Stay fast, stay honest.

## When to Use

- After a focused edit to one or a few files
- After a bug fix, config change, or small feature step
- Before committing to confirm nothing is broken
- When full `npm run verify` would be slower than the change warrants
- As a quick gate between implementation steps

## Required Context

1. **Read `PRD.md`** if it exists — understand what the project considers "passing."
2. **Read `README.md`** if it exists — identify documented validation commands.
3. **Read `package.json` scripts** — identify the actual available check commands.
4. Do not create `docs/plan.md` or any duplicate primary planning document.

## Procedure

### Step 1 — Determine What Changed

Identify the scope of the change:

```
git diff --name-only          # unstaged changes
git diff --cached --name-only # staged changes
git diff HEAD~1 --name-only   # last commit (if just committed)
```

Classify the changed files:

| File Pattern                           | Change Type             |
| -------------------------------------- | ----------------------- |
| `*.ts`, `*.tsx`                        | Source code             |
| `*.test.ts`                            | Test code               |
| `*.css`                                | Styles                  |
| `*.md`                                 | Documentation           |
| `package.json`, lockfile               | Dependencies            |
| `tsconfig.json`, `eslint.config.*`     | Toolchain config        |
| `Dockerfile`, `docker-compose.yml`     | Container config        |
| `.github/workflows/*`                  | CI config               |
| `.github/agents/*`, `.github/skills/*` | Agent/skill definitions |
| `.env*`                                | Environment config      |

### Step 2 — Select Checks

Pick the narrowest set of checks that covers the change:

| Change Type                 | Minimum Checks                                                        |
| --------------------------- | --------------------------------------------------------------------- |
| Source code (`.ts`, `.tsx`) | TypeScript compile + lint + targeted tests                            |
| Test code only              | Run the changed test file(s)                                          |
| Styles only                 | Build (to catch CSS errors)                                           |
| Documentation only          | No code checks needed; verify links if tooling exists                 |
| Dependencies                | Install + typecheck + lint + full test suite                          |
| Toolchain config            | The tool that config affects (e.g., lint for eslint config)           |
| Container config            | Docker build                                                          |
| CI config                   | Lint the workflow file if possible; otherwise note as "manual review" |
| Agent/skill definitions     | No code checks; verify file parses (no YAML errors)                   |
| Environment config          | Build + startup check                                                 |
| Mixed (source + tests)      | TypeScript compile + lint + targeted tests                            |
| Mixed (broad)               | Full verification (`npm run verify` or equivalent)                    |

### Step 3 — Map to Repo Commands

Use the repo's actual commands. Common mappings for this project:

| Check              | Command                                                      |
| ------------------ | ------------------------------------------------------------ |
| TypeScript compile | `npx tsc --noEmit`                                           |
| Lint               | `npm run lint`                                               |
| Full test suite    | `npx vitest run`                                             |
| Targeted test      | `npx vitest run <file-pattern>`                              |
| Build              | `npm run build`                                              |
| Full verify        | `npm run verify`                                             |
| Docker build       | `docker build --file Dockerfile --tag computelearn:verify .` |

If README.md documents different commands, note the mismatch.

### Step 4 — Run and Record

Run each selected check. For each, record:

- **Command**: exact command run
- **Why**: why this check was selected
- **Result**: pass, fail, skipped, not applicable, or not run
- **Duration**: approximate time (optional but useful)

### Step 5 — Handle Failures

If any check fails:

1. **Exact command** that failed
2. **Error location** — file and line if available
3. **Failure class**:
   - Type error
   - Lint violation
   - Test assertion failure
   - Build error
   - Runtime error
   - Configuration error
   - Docker build error
4. **Recommended next action** — which agent or skill should handle the fix:
   - Type/lint/build error → `implementer` or the developer
   - Test failure → `test-specialist`
   - Docker error → `environment-docker-setup`
   - CI error → `ci-cd-builder`
   - Security finding → `security-reviewer`

## Output Format

```
## Fast Verification Report

### Scope
Files changed: [list or count]
Change type: [classification]

### Checks Run
| Check | Command | Result |
|-------|---------|--------|
| ... | ... | pass/fail/skipped |

### README Drift
[Any mismatch between documented and actual validation commands, or "None detected"]

### Result
**Fast verification passed** / **Fast verification failed**

### Failures (if any)
- Command: ...
- Error: ...
- Location: ...
- Failure class: ...
- Recommended: [agent or skill]

### Next Action
[What should happen next — commit, continue, fix, escalate]
```

## Rules

- Do not claim success if key checks were skipped. Mark skipped checks explicitly.
- Do not run full-project validation unless the change scope justifies it. Prefer targeted checks.
- Do not guess at results. Run the command and report what happened.
- Prefer targeted evidence over vague assurance.
- If the change is broad (dependencies, toolchain config, or many files), escalate to full verification.
- End with exactly one of: **"Fast verification passed"** or **"Fast verification failed"**.
