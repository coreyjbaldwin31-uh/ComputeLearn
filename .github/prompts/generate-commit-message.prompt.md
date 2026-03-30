---
description: "Generate a well-structured commit message from a diff and description. Use after making changes to ensure commits are descriptive and follow conventions."
name: "Generate Commit Message"
argument-hint: "Describe the change. If omitted, the agent will inspect staged files and generate a message."
---

Generate a professional commit message following conventional commit format.

Steps:

1. Inspect the staged changes using `git diff --cached` or the provided description.
2. Identify the type: `feat` (feature), `fix` (bugfix), `refactor`, `docs`, `test`, `chore`, or `perf`.
3. Write the subject line: `<type>(<scope>): <description>` (50 chars max, no period).
4. If the change is substantial, add a blank line and write a body (wrap at 72 chars) explaining **why** and **what** changed, not the mechanics.
5. Return the message formatted for use with `git commit -m "..."`.

Example:

```
feat(validation-engine): add timeout handling for long-running checks

Validation checks can now be interrupted if they exceed a user-configurable timeout.
This prevents the platform from blocking indefinitely on slow external services.

Closes #42
```

Keep the message factual and concise. Avoid generic language like "fix bugs" or "update code."
