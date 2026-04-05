# ComputeLearn

ComputeLearn is an interactive training platform concept for taking a regular computer user to practical software engineering competence through guided, hands-on practice.

## Product direction

The platform is designed around a strict progression:

- Computer mastery first: operating system fluency, files, terminal usage, automation, and tool confidence.
- Software engineering next: coding, debugging, Git, APIs, environments, testing, and delivery workflows.
- Modern workflows last: containers, deployment thinking, and disciplined AI-assisted engineering.

The core product rule is that learners should practice inside controlled, reversible environments rather than passively consuming explanations.

## Current implementation in this repository

The current app goes beyond a curriculum shell. It now includes:

- **37 lessons across 4 phases** — computer mastery, programming foundations, engineering workflow, independent build
- **38 lab templates** across all phases with terminal simulation, file editing, and validation
- **22 inline code exercises** across 13 lessons with pattern-based validation
- **505 automated tests** (unit + component) with Vitest across 59 test files
- phased learning progression with milestone gating
- learner profile, local progress persistence, notes, reflections, and review scheduling
- guided exercises, transfer tasks, and evidence-gated lesson completion
- layered hints, inspect mode, and diff-style inspection output for failed validation
- competency dashboard tracking 15 domains with mastery ladder (Aware → Independent)
- transfer analytics, independent readiness, independent lab completion, repeated error reduction, milestone pass rate, artifact coverage, and outcomes rollup panels
- artifact history, evidence browsing, and markdown export of learner work
- lab UI panel wired into lesson view with start, validate, reset, hint escalation, and completion summary
- terminal simulator connected to active lab instances with command-output capture, lab filesystem, and file content display
- interactive code exercises with starter code, pattern-based validation, and hints
- focus traps, keyboard navigation, and skip-link throughout
- WCAG-conscious colour contrast and prefers-reduced-motion support
- curriculum completion banner when all lessons are finished
- responsive layout down to 480 px viewports
- health endpoint at `/api/health`
- Docker multi-stage build with non-root runtime and health check
- explicit safe-lab framing and guardrails

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `j` | Next lesson |
| `k` | Previous lesson |
| `?` | Toggle keyboard shortcut overlay |
| `Ctrl+Shift+D` | Toggle dark mode |
| `Escape` | Close any open dialog or overlay |

## Still open platform work

- true workspace/template runtime beyond the current in-memory lab-engine model

## Planned product capabilities

- real project templates with seeded bugs and guided objectives
- bounded review loops for AI-assisted workflows
- stronger lab runtime and validation depth
- durable saved outputs, transcripts, and learner artifacts beyond browser-local persistence
- deeper spaced repetition and revisit prompts

## Development

Prerequisites: Node.js 20+, npm.

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Run linting:

```bash
npm run lint
```

Run type-checking:

```bash
npm run type-check
```

Run tests:

```bash
npm run test
```

Run all checks (lint, type-check, test, build):

```bash
npm run verify
```

Build and run with Docker:

```bash
# First-time setup — create your local env file
cp .env.example .env

# Build the image and start the container
docker compose up --build

# Or run detached
docker compose up --build -d
```

Stop the container:

```bash
docker compose down
```

Rebuild after dependency or config changes:

```bash
docker compose build --no-cache
docker compose up -d
```

Check container health:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f app
```

Run API smoke tests (requires a running server):

```bash
# Start the app first, then in a separate terminal:
npm run api:test
```

## CI

Pushes and pull requests to `main` run four jobs via GitHub Actions (`.github/workflows/ci.yml`):

| Job | Steps | Purpose |
| --- | --- | --- |
| **Quality gate** | `npm run lint`, `npm run type-check` | Fast feedback on code hygiene |
| **Test** | `npm run test` | Verify correctness (309 unit/integration tests) |
| **Build** | `npm run build` + bundle budget | Verify production build succeeds and client bundle stays under 2 MB |
| **Docker build & health** | `docker build` + health probe | Verify container image builds and passes health check |

Test, Build, and Docker run in parallel after the Quality gate passes.

To match CI locally:

```bash
npm run verify
```

No secrets are required — monitoring is DSN-gated and stays disabled when env vars are absent.

## Monitoring

Local telemetry and error reporting are wired through Sentry and OpenTelemetry.

Set these environment variables in `.env` if you want live reporting:

- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_ENVIRONMENT`
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT`
- `SENTRY_TRACES_SAMPLE_RATE`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`
- `OTEL_SERVICE_NAME`

Server request errors are reported through [`instrumentation.ts`](instrumentation.ts), browser routing hooks are registered in [`instrumentation-client.ts`](instrumentation-client.ts), and app-render failures are captured in [`app/error.tsx`](app/error.tsx).

The app will still run without them. When the DSN is absent, Sentry stays disabled.

### Verifying Sentry

Hit the test route to send a smoke event without opening a browser console:

```
curl http://localhost:3000/api/sentry-test
```

Returns `{ "ok": true, "eventId": "…" }` when the DSN is configured, or a 503 when it is absent.

### Health endpoint

A lightweight readiness probe is available for Docker healthchecks and load balancers:

```
curl http://localhost:3000/api/health
```

Returns `{ "status": "ok", "uptime": …, "timestamp": "…" }`.

### Secrets in CI / deployed environments

The CI build job reads `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` from GitHub Actions secrets so production bundles include Sentry wiring. Add these two secrets in the repository settings if hosted environments should report errors:

| Secret | Purpose |
| --- | --- |
| `SENTRY_DSN` | Server-side error reporting |
| `NEXT_PUBLIC_SENTRY_DSN` | Client-side error reporting (embedded in JS bundle) |

For local development, `.env` is the source of truth (gitignored). Copy `.env.example` and fill in the DSN values. For deployed/hosted environments, set the DSN through the platform's secret management (Vercel Environment Variables, AWS Secrets Manager, etc.) rather than committing credentials.

## Repository structure

See [docs/repository-map.md](docs/repository-map.md) for a detailed layout. Key areas:

| Path | Purpose |
| --- | --- |
| `app/` | Next.js App Router — single-page entry at `/` |
| `components/` | React components and hooks |
| `data/` | Curriculum definition (phases, courses, lessons) |
| `lib/` | Stateless engines for validation, progression, analytics |
| `docs/` | Contributor and process documentation |
| `.github/` | CI workflows, agent definitions, skills |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch strategy, PR policy, and required checks.

Branch protection setup guidance is documented in [docs/branch-protection-setup.md](docs/branch-protection-setup.md).

Repository labels guidance is documented in [docs/repository-labels.md](docs/repository-labels.md).
