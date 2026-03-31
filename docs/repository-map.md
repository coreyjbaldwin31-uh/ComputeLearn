# Repository Map

Quick orientation for contributors.

## Top-level layout

```text
app/              Next.js App Router (single route at /)
components/       React UI components and hooks
data/             Curriculum data (curriculum.ts)
lib/              Stateless domain engines with colocated tests
docs/             Contributor and process documentation
.github/          CI workflows, agent definitions, skill procedures
```

## app/

| File | Role |
| --- | --- |
| `layout.tsx` | Root layout, metadata, global styles |
| `page.tsx` | Entry page — renders `<TrainingPlatform>` inside `<ErrorBoundary>` |
| `error.tsx` | App Router error boundary — captures render errors via Sentry |
| `globals.css` | Global stylesheet |

Single-page app: all navigation happens client-side inside `TrainingPlatform`.

## components/

| Component | Role |
| --- | --- |
| `training-platform.tsx` | Main shell — state orchestration, engine wiring, panel composition |
| `code-exercise.tsx` | Code editor for exercises with validation, hints, and attempt tracking |
| `lab-panel.tsx` | Lab UI — start, validate, reset, hint escalation, file editing, completion summary |
| `terminal-simulator.tsx` | Simulated CLI with command matching, alias normalisation, and filesystem simulation |
| `inspection-panel.tsx` | Inspection output for failed validation (signals, skill gaps, prompts) |
| `sidebar-panels.tsx` | Left panels: phase selector, progress, competency dashboard, analytics |
| `rail-panels.tsx` | Right panels: lesson analytics, reinforcement, review queue, phase status |
| `error-boundary.tsx` | React error boundary with reload fallback and Sentry capture |
| `hooks/use-learner-profile.ts` | localStorage-backed learner profile with `useSyncExternalStore` |

## data/

| File | Role |
| --- | --- |
| `curriculum.ts` | 2,400+ line typed curriculum definition — 4 phases, 10 courses, 37 lessons with exercises, transfer tasks, competency mappings, and validation rules |
| `lab-templates.ts` | 10 Phase 1 lab templates with initial files, validation rules, and layered hints |
| `lab-templates.test.ts` | 26 structural tests ensuring template completeness and rule consistency |

## lib/

22 modules with colocated `.test.ts` files. Domain engines are pure functions operating on curriculum and learner progress records.

| Engine | Purpose |
| --- | --- |
| `validation-engine` | Exercise answer evaluation against criteria |
| `lab-engine` | Workspace template model, validation rules, reset/replay, hints, artifacts |
| `progression-engine` | Lesson flattening, mastery calculation, review scheduling, phase exit |
| `competency-engine` | Mastery level management and weak-track identification |
| `hint-engine` | Layered hint progression |
| `inspection-engine` | Signal matching, skill gap diagnosis, inspection prompts |
| `milestone-engine` | Phase milestone gating (competency, transfer, reinforcement) |
| `phase-status-engine` | Phase status records and reinforcement counts |
| `reflection-engine` | Reflection prompt generation |
| `reinforcement-engine` | Spaced repetition queue |
| `artifact-engine` | Artifact and attempt record factories |
| `artifact-browser-engine` | Artifact counts and recent-item listing |
| `artifact-completion-engine` | Artifact coverage rates by phase |
| `artifact-export-engine` | Markdown export of artifacts |
| `attempt-analytics-engine` | Pass/fail rates, error reduction, recovery counts |
| `competency-dashboard-engine` | Dashboard records for competency display |
| `outcomes-dashboard-engine` | Aggregate outcome scoring and status |
| `milestone-pass-rate-engine` | Milestone pass rates per phase |
| `transfer-analytics-engine` | Transfer task pass rates |
| `independent-lab-engine` | Independent lab completion summaries |
| `independent-readiness-engine` | Capstone readiness checks |
| `monitoring` | Sentry error capture and OpenTelemetry span helpers |

## .github/

| Path | Role |
| --- | --- |
| `workflows/ci.yml` | CI pipeline: lint, type-check, test, build, docker-build |
| `agents/` | 18 custom agent definitions for autonomous workflows |
| `skills/` | 12 procedural skill files for targeted tasks |
| `scripts/` | Pre-tool safety check for dangerous command detection |
| `copilot-instructions.md` | Project-wide Copilot customization |

## Root-level config files

| File | Role |
| --- | --- |
| `instrumentation.ts` | Next.js server instrumentation — registers OpenTelemetry and Sentry |
| `instrumentation-client.ts` | Next.js client instrumentation — Sentry router transition hooks |
| `sentry.client.config.ts` | Sentry browser SDK init (DSN-gated) |
| `sentry.server.config.ts` | Sentry Node SDK init (DSN-gated) |
| `sentry.edge.config.ts` | Sentry edge runtime init (DSN-gated) |
| `next.config.ts` | Next.js configuration — strict mode, standalone output, Turbopack |
| `tsconfig.json` | TypeScript — strict, bundler resolution, `@/*` path alias |
| `eslint.config.mjs` | ESLint — Next.js core-web-vitals + TypeScript rules |
| `vitest.config.ts` | Vitest — node environment, `lib/` and `data/` test globs |
| `postcss.config.mjs` | PostCSS (default Next.js config) |

## Key scripts

| Script | Command |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run verify` | Full gate: lint + type-check + test + build |
| `npm run test` | Run Vitest suite |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run `tsc --noEmit` |
| `npm run build` | Production build |
| `npm run docker:up` | Build and start via Docker Compose |
| `npm run api:test` | Run Newman API smoke tests against a running server |
