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
- explicit safe-lab framing and guardrails

## Still open platform work

- true workspace/template runtime with deterministic baseline state plus reset/replay at the lab-engine level
- validator expansion for file presence, directory structure, command output, code behavior, and test pass criteria
- explicit curriculum validation and preview-deploy workflow expansion in CI
- final branch/process hardening around the intended integration workflow

## Planned product capabilities

- real project templates with seeded bugs and guided objectives
- bounded review loops for AI-assisted workflows
- stronger lab runtime and validation depth
- durable saved outputs, transcripts, and learner artifacts beyond browser-local persistence
- deeper spaced repetition and revisit prompts

## Development

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

Build and run with Docker:

```bash
docker compose up --build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch strategy, PR policy, and required checks.

Branch protection setup guidance is documented in [docs/branch-protection-setup.md](docs/branch-protection-setup.md).

Repository labels guidance is documented in [docs/repository-labels.md](docs/repository-labels.md).
