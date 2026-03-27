# Contributing to ComputeLearn

This repository follows a strict PR-first workflow.

## Branching strategy

- Long-lived branches:
- `main`: production-ready branch
- `develop`: integration branch for upcoming release work
- Short-lived branches:
- `feature/<scope>`
- `bugfix/<scope>`
- `hotfix/<scope>`
- `release/<version-or-date>`

## Current workflow note

- Default target branch for new feature work is `develop`.
- During repository bootstrap, branch-model migration, or maintainer-directed hardening work, a PR may explicitly target `main`.
- If a task or active coordination thread names a different base branch, follow that instruction instead of assuming the default.

## Local quality checks

Run all checks before opening a PR:

```bash
npm ci
npm run lint
npm run type-check
npm run test
npm run build
```

## Docker parity checks

Build and run the production image locally:

```bash
docker build -t computelearn:local .
docker run --rm -p 3000:3000 computelearn:local
```

Or use compose:

```bash
docker compose up --build
```

## Pull request requirements

- PR targets `develop` for normal feature work unless a maintainer explicitly directs the work to `main`
- PR targets `main` for release/hotfix workflows and approved bootstrap or hardening exceptions
- At least one approval is required
- All required CI checks must pass
- Branch must be up to date before merge
- Use clear commit messages with scope and intent

## Merge policy

- Prefer squash merge for feature branches
- Keep each PR focused and reviewable
- Do not bypass required checks except emergency owner-approved hotfix
