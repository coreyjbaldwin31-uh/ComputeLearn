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
| `globals.css` | Global stylesheet |

Single-page app: all navigation happens client-side inside `TrainingPlatform`.

## components/

| Component | Role |
| --- | --- |
| `training-platform.tsx` | Main shell — state orchestration, engine wiring, panel composition |
| `code-exercise.tsx` | Code editor for exercises with validation, hints, and attempt tracking |
| `terminal-simulator.tsx` | Simulated CLI with command matching and filesystem simulation |
| `inspection-panel.tsx` | Inspection output for failed validation (signals, skill gaps, prompts) |
| `sidebar-panels.tsx` | Left panels: phase selector, progress, competency dashboard, analytics |
| `rail-panels.tsx` | Right panels: lesson analytics, reinforcement, review queue, phase status |
| `error-boundary.tsx` | React error boundary with reload fallback |
| `hooks/use-learner-profile.ts` | localStorage-backed learner profile with `useSyncExternalStore` |

## data/

`curriculum.ts` — 2,400+ line typed curriculum definition containing 4 phases, 10 courses, 37 lessons with exercises, transfer tasks, competency mappings, and validation rules.

## lib/

21 stateless engines with colocated `.test.ts` files. All are pure functions operating on curriculum and learner progress records.

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

## .github/

| Path | Role |
| --- | --- |
| `workflows/ci.yml` | CI pipeline: lint, type-check, test, build, docker-build |
| `agents/` | 18 custom agent definitions for autonomous workflows |
| `skills/` | 12 procedural skill files for targeted tasks |
| `scripts/` | Pre-tool safety check for dangerous command detection |
| `copilot-instructions.md` | Project-wide Copilot customization |

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
