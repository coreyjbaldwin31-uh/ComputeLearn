---
name: "dependency-hygiene"
description: "Normalize dependencies, scripts, lockfiles, package managers, and runtime expectations. Use when: a repo has dependency drift, mismatched tooling, redundant libraries, broken scripts, or uncertain install behavior. Keywords: dependency, package, lockfile, npm, pnpm, yarn, scripts, runtime, version, drift, unused, duplicate, normalize."
---

# Dependency Hygiene

Normalize project dependencies, scripts, and tooling so install, build, test, and run work reliably and consistently.

## When to Use

- After inheriting or auditing a repository
- When `npm install` or equivalent fails or produces warnings
- When multiple package managers coexist (e.g., both `yarn.lock` and `package-lock.json`)
- When scripts reference tools that are not installed
- When runtime versions disagree across config files
- When unused or duplicate dependencies accumulate
- Before a major feature push or release preparation

## Required Context

1. **Read `PRD.md`** if it exists — understand project scope and tooling requirements.
2. **Read `README.md`** if it exists — understand documented prerequisites, install steps, and commands.
3. **Read `package.json`** (or equivalent manifest) — the primary source of truth for dependencies and scripts.
4. **Read lockfile** — `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, or equivalent.
5. Do not create `docs/plan.md` or any duplicate primary planning document.

## Procedure

### Step 1 — Detect Package Manager and Runtime

Identify the primary package manager from evidence:

| Signal | Package Manager |
|--------|----------------|
| `package-lock.json` | npm |
| `yarn.lock` | Yarn |
| `pnpm-lock.yaml` | pnpm |
| `.npmrc` with pnpm settings | pnpm |
| `packageManager` field in `package.json` | Whichever is specified |

Check for conflicts:

- Multiple lockfiles present → pick one, document the decision, remove the other
- `packageManager` field disagrees with lockfile → align them
- CI uses a different manager than local → align them

Identify runtime version expectations:

| Source | Check |
|--------|-------|
| `package.json` `engines` | Node, npm version constraints |
| `.nvmrc` / `.node-version` | Node version pin |
| `Dockerfile` `FROM` line | Runtime version in container |
| CI workflow | Runtime version in CI |
| `tsconfig.json` `target` | TypeScript compilation target |

Flag mismatches. All sources should agree on the major.minor version.

### Step 2 — Audit Dependencies

#### Production dependencies

For each dependency in `dependencies`:

- Is it actually imported in source code? (Search for `import ... from '<pkg>'` or `require('<pkg>')`)
- Is it duplicated by another dependency that does the same job?
- Is the version pinned appropriately for the project's needs?

#### Dev dependencies

For each dependency in `devDependencies`:

- Is it used by a script, config file, or test?
- Is it duplicated by another dev dependency?
- Should it be in `dependencies` instead (used at runtime)?

#### Common issues to flag

| Issue | Example | Action |
|-------|---------|--------|
| Unused dependency | Package installed but never imported | Remove if clearly unused |
| Duplicate purpose | Both `axios` and `node-fetch` for HTTP | Keep one, remove the other |
| Wrong section | Runtime package in devDependencies | Move to dependencies |
| Stale version | Major version behind with known breaking changes | Note but do not auto-upgrade |
| Unnecessary peer | Peer dependency warning for unused feature | Note, do not add unless needed |

**Important:** Only remove packages you can confirm are unused. If uncertain, flag for manual review rather than removing.

### Step 3 — Audit Scripts

Check `package.json` scripts for completeness and correctness:

| Script | Purpose | Check |
|--------|---------|-------|
| `dev` | Start development server | Command references installed tool? |
| `build` | Production build | Command works? |
| `start` | Start production server | Command works after build? |
| `lint` | Run linter | Linter is installed and configured? |
| `test` | Run tests | Test framework is installed? |
| `typecheck` | TypeScript type checking | `tsc` is available? |
| `format` | Code formatter | Formatter is installed? |
| `verify` | Composite validation | Runs the right sub-commands? |

Common script issues:

| Issue | Example | Fix |
|-------|---------|-----|
| References missing tool | `"lint": "biome check"` but biome not installed | Install or change to available linter |
| Inconsistent with CI | CI runs `npm run typecheck` but script doesn't exist | Add the script |
| Dead script | Script for removed feature | Remove |
| Missing script | No test script but test framework is installed | Add |

### Step 4 — Normalize Lockfile

- If the lockfile is missing, generate it: `npm install`, `yarn install`, or `pnpm install`
- If the lockfile is stale (doesn't match `package.json`), regenerate it
- If multiple lockfiles exist, delete all but the one matching the chosen package manager
- Verify `npm ci` (or equivalent clean install) works from the lockfile

### Step 5 — Pin Versions Where Needed

Decide on version strategy:

| Context | Strategy |
|---------|----------|
| Application (deployed) | Pin exact versions or use lockfile |
| Library (published) | Use semver ranges |
| Dev tools | Pin major, allow minor/patch |
| Runtime (Node, Python) | Pin major.minor in engines and CI |

Check that `engines` in `package.json` reflects the actual minimum runtime version.

### Step 6 — Update README.md

Update when any of these changed:

- Prerequisites (runtime version, package manager)
- Install command
- Available scripts
- Required environment setup before install
- Known install issues or workarounds

### Step 7 — Optional: docs/dependencies.md

Create or update if the project has:

- Non-obvious dependency choices worth documenting
- Specific version pins with reasons
- Known compatibility constraints
- Migration notes (e.g., "migrating from Yarn to npm")

Skip if the project is simple and `package.json` is self-explanatory.

## Output Format

```
## Dependency Decisions

### Package Manager
- Manager: [npm | yarn | pnpm]
- Lockfile: [present and current | regenerated | conflict resolved]
- Conflicts found: [list or "none"]

### Runtime Alignment
| Source | Version | Aligned |
|--------|---------|---------|
| package.json engines | ... | yes/no |
| .nvmrc | ... | yes/no/n/a |
| Dockerfile | ... | yes/no/n/a |
| CI workflow | ... | yes/no/n/a |

### Dependencies Changed
| Package | Action | Reason |
|---------|--------|--------|
| ... | removed/moved/noted | ... |

### Scripts Changed
| Script | Action | Reason |
|--------|--------|--------|
| ... | added/fixed/removed | ... |

### README Updated
- [what changed, or "no changes needed"]

### Verification
| Check | Command | Result |
|-------|---------|--------|
| Clean install | `npm ci` | pass/fail |
| Build | `npm run build` | pass/fail |
| Test | `npm test` | pass/fail |
| Lint | `npm run lint` | pass/fail |

### Remaining Issues
- [anything that needs manual review or user decision]
```

## Rules

- Do not perform broad upgrades without reason. Only upgrade when a specific problem requires it.
- Do not add multiple tools for the same responsibility without clear justification.
- Do not remove packages you cannot confirm are unused. Flag for review instead.
- Prefer stable mainstream libraries over trendy alternatives.
- Preserve ecosystem conventions. Do not impose a different stack style.
- Keep the repo easier to install and run than before, not harder.
- End with a section titled **"Dependency Decisions"** listing every change and its rationale.
