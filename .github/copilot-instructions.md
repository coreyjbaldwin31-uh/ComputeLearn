# Copilot instructions for ComputeLearn

## Project overview

ComputeLearn is a Next.js learning platform focused on guided, hands-on software engineering practice. Changes should reinforce a progression from computer fundamentals to modern engineering workflows.

## Tech stack

- Next.js App Router
- React 19
- TypeScript
- ESLint via `npm run lint`

## Working conventions

- Prefer small, focused components and keep logic typed.
- Reuse existing patterns in `app`, `components`, and `data` before introducing new abstractions.
- Preserve the learner-facing tone: practical, supportive, and safety-conscious.
- Avoid adding dependencies unless they clearly reduce maintenance or implementation risk.
- Keep styling consistent with the existing CSS and component structure.

## Autonomous delivery

- When the user explicitly asks for autonomous execution, continue from audit through implementation, validation, and repo hygiene with minimal back-and-forth.
- Prefer repeatable automation paths first: npm scripts, VS Code tasks, Docker commands, Git and GitHub tooling, and deterministic CLI workflows.
- Keep the remote branch current with small verified commits and pushes only when the user has explicitly asked for autonomous repo updating.
- Use Docker for environment parity, build checks, and runtime validation when the repository already includes container assets.
- Use Postman, Newman, or equivalent HTTP tooling for API verification when relevant and available.

## Validation

Before finishing a change, run the existing checks when relevant:

- `npm run lint`
- `npm run build`

