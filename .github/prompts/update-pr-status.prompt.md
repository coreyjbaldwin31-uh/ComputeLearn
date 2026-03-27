---
description: "Post a structured progress summary to the active pull request on GitHub. Use after completing a verified increment to keep the PR timeline current."
name: "Update PR Status"
argument-hint: "Describe what was just completed. If omitted, the agent summarizes the most recent commits."
---
Post a progress update comment to the active pull request for this repository.

Steps:

1. Determine the active PR number and repository from the repository context or recent git log.
2. Identify what changed in the most recent verified increment by inspecting the last 1–3 commit messages, the files changed, and the validation results if available.
3. Compose a concise PR comment using this structure:

   **Progress Update**

   **Completed:** [What was implemented or fixed]
   **Validation:** [Which checks passed: lint / type-check / tests / build / docker]
   **Branch:** [Current branch name]
   **Next:** [Highest-priority remaining item or "scope complete"]

4. Post the comment using the available GitHub tooling.
5. Do not duplicate a comment that already captures the same increment. Check the last comment before posting.

Keep comments brief and factual. Avoid restating the full change history already visible in the commit log.
