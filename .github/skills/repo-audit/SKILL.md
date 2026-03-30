---
name: "repo-audit"
description: "Perform a disciplined current-state audit of a repository before planning or implementation begins. Use when: starting a project, inheriting an older repo, after drift, or whenever the real repo state is unclear. Keywords: audit, repository, current state, stack, drift, baseline, structure, health check."
---

# Repository Audit

Perform a structured current-state audit of the repository, separating confirmed facts from assumptions and unknowns.

## When to Use

- Starting work on a new or inherited repository
- After a long period without active development
- When PRD.md, README.md, and the actual repo may have drifted apart
- Before planning or implementation to establish a reliable baseline
- When the real state of the repo is unclear or contradictory

## Required Context

1. **Read `PRD.md`** if it exists — canonical product requirements and execution plan.
2. **Read `README.md`** if it exists — canonical setup, run, verification, and contributor orientation.
3. Do not create `docs/plan.md` or any duplicate primary planning document. `PRD.md` is the plan.

## Audit Procedure

### Step 1 — Repository Structure

Inspect and record:

- Top-level files and folders
- Entrypoints (`app/`, `src/`, `pages/`, `index.*`)
- Major subsystems and their apparent purpose
- File count and depth (shallow vs deep nesting)
- Any obvious dead or orphaned directories

### Step 2 — Branch and Version Control State

- Current branch and default branch
- Recent commit activity (`git log --oneline -20`)
- Uncommitted or unstaged changes (`git status`)
- Open PRs or stale branches
- `.gitignore` presence and adequacy

### Step 3 — Package Manager and Dependencies

- Identify the package manager: npm, pnpm, yarn, pip, cargo, etc.
- Check for lockfile presence and consistency (e.g., `package-lock.json` matches `package.json`)
- Verify `node_modules` or equivalent is installed and not stale
- Flag mismatched package managers (e.g., both `yarn.lock` and `package-lock.json`)
- Scan `package.json` scripts for build, test, lint, verify, and start commands

### Step 4 — Language Runtime and Build System

- Detect the primary language and framework (TypeScript, Python, Go, etc.)
- Check runtime version constraints (engines, `.nvmrc`, `.python-version`, `rust-toolchain.toml`)
- Identify the build system and verify the build command works
- Check for TypeScript config (`tsconfig.json`), linter config, formatter config

### Step 5 — Test System

- Identify the test framework (Vitest, Jest, pytest, etc.)
- Check for test files and their location
- Run the test command and record pass/fail count
- Note any skipped, broken, or zero-coverage areas

### Step 6 — Environment and Secrets

- Check for `.env.example` or `.env.template`
- Flag `.env` files that might be committed (security risk)
- Identify environment variable references in code
- Check for hardcoded secrets or API keys

### Step 7 — Container and CI/CD

- Check for `Dockerfile`, `docker-compose.yml`, `.devcontainer/`
- Verify Docker build works if Dockerfile exists
- Check for CI workflow files (`.github/workflows/`, `.gitlab-ci.yml`, etc.)
- Verify CI jobs match local validation commands
- Flag mismatches between CI and local build/test/lint steps

### Step 8 — Documentation State

- Inventory existing docs: README.md, PRD.md, CONTRIBUTING.md, `docs/` folder
- Check whether documented commands actually work
- Identify stale references to removed features, old paths, or obsolete workflows
- Compare PRD.md task status against actual implementation state
- Note any contradictions between README.md and actual repo behavior

### Step 9 — Deployment Artifacts

- Check for deploy config: `vercel.json`, `fly.toml`, `render.yaml`, serverless config
- Check for release scripts, version tags, or changelog
- Determine deployment target: container, platform host, static, serverless, or none

## Classification

Based on the evidence, classify the repository:

| Classification                | Criteria                                                              |
| ----------------------------- | --------------------------------------------------------------------- |
| **Greenfield**                | No meaningful source code yet; mostly scaffolding or empty            |
| **Partially scaffolded**      | Structure exists but key subsystems are stubs or incomplete           |
| **Active and aligned**        | Code, docs, and config are consistent and current                     |
| **Active but drifting**       | Working code exists but docs, config, or tests have fallen behind     |
| **Structurally inconsistent** | Conflicting configs, dead code, broken scripts, or contradictory docs |

## Output Format

Produce a structured audit with these sections:

```
## Repository Audit

### Classification
[greenfield | partially scaffolded | active and aligned | active but drifting | structurally inconsistent]

### Confirmed Stack
- Language: ...
- Framework: ...
- Package manager: ...
- Test framework: ...
- Build system: ...
- Container: yes/no
- CI/CD: yes/no
- Deploy target: ...

### Current State Summary
Brief factual summary of what exists, works, and is active.

### Documentation Drift
Contradictions or stale content found between PRD.md, README.md, and actual repo state.

### Missing Baseline Items
Items that should exist but do not (e.g., .gitignore, env template, CI workflow, tests).

### Risks
Issues that could block or complicate upcoming work.

### Unknowns
Things that could not be determined from repo evidence alone.

### Recommended Next Actions
Prioritized list of what should happen next.

### Recommended Next Step
Name the next agent or skill in the workflow:
- dependency-manager → if dependencies are messy or outdated
- environment-docker-setup → if container or environment config is missing
- ci-cd-builder → if CI/CD is missing or broken
- planner → if the repo is healthy and ready for planning
- verifier → if the repo looks good and just needs validation
```

## Rules

- Do not invent architecture, commands, or requirements. Report only what the repo shows.
- Separate confirmed facts from assumptions and unknowns. Label each clearly.
- Do not modify code unless a tiny documentation correction is necessary to complete the audit.
- Prefer evidence from the repo over assumptions from the request.
- Highlight contradictions between PRD.md, README.md, and actual repo behavior.
- If `docs/repo-audit.md` would add lasting value (e.g., for team onboarding), create it. Otherwise, produce the audit in chat output only.
