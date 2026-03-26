# ComputeLearn

ComputeLearn is an interactive training platform concept for taking a regular computer user to practical software engineering competence through guided, hands-on practice.

## Product direction

The platform is designed around a strict progression:

- Computer mastery first: operating system fluency, files, terminal usage, automation, and tool confidence.
- Software engineering next: coding, debugging, Git, APIs, environments, testing, and delivery workflows.
- Modern workflows last: containers, deployment thinking, and disciplined AI-assisted engineering.

The core product rule is that learners should practice inside controlled, reversible environments rather than passively consuming explanations.

## MVP in this repository

This first version implements a curriculum shell with:

- phased learning progression
- course and lesson navigation
- concept explanation and guided demonstration sections
- hands-on exercises with lightweight validation
- local progress persistence
- local lesson notes persistence
- explicit safe-lab framing and guardrails

## Planned product capabilities

- sandboxed workspaces and resettable labs
- command validation against isolated environments
- real project templates with seeded bugs and guided objectives
- review loops for AI-assisted workflows
- saved outputs, transcripts, and learner artifacts
- spaced repetition and revisit prompts

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

Build and run with Docker:

```bash
docker compose up --build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch strategy, PR policy, and required checks.

Branch protection setup guidance is documented in [docs/branch-protection-setup.md](docs/branch-protection-setup.md).

Repository labels guidance is documented in [docs/repository-labels.md](docs/repository-labels.md).
