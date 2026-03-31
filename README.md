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

- phased learning progression with milestone gating
- learner profile, local progress persistence, notes, reflections, and review scheduling
- guided exercises, transfer tasks, and evidence-gated lesson completion
- layered hints, inspect mode, and diff-style inspection output for failed validation
- competency dashboard, transfer analytics, independent readiness, independent lab completion, repeated error reduction, milestone pass rate, artifact coverage, and outcomes rollup panels
- artifact history, evidence browsing, and markdown export of learner work
- lab UI panel wired into lesson view with start, validate, reset, hint escalation, and completion summary
- terminal simulator connected to active lab instances with command-output capture, lab filesystem, and file content display
- explicit safe-lab framing and guardrails

## Still open platform work

- test-pass validation rule integration with terminal (command-output rules are now connected)
- true workspace/template runtime beyond the current in-memory lab-engine model
- explicit curriculum validation and preview-deploy workflow expansion in CI

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
| **Test** | `npm run test` | Verify correctness (234 unit/integration tests) |
| **Build** | `npm run build` | Verify production build succeeds |
| **Docker build** | `docker build` | Verify container image builds |

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
