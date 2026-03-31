# Branch Protection Setup (GitHub)

Apply these rules in GitHub repository settings for `main`.

## Recommended strict settings

1. Require a pull request before merging: enabled
2. Require approvals: enabled (minimum 1)
3. Dismiss stale approvals when new commits are pushed: enabled
4. Require status checks to pass before merging: enabled
5. Required checks (use the exact check names shown in the PR UI, typically
   `<workflow name> / <job name>`):
- `CI / Quality gate`
- `CI / Test`
- `CI / Build`
- `CI / Docker build`
6. Require branches to be up to date before merging: enabled
7. Restrict who can push to matching branches: enabled (maintainers only)
8. Allow force pushes: disabled
9. Allow deletions: disabled

## Ruleset notes

- Apply the strict baseline to `main`.
- If checks are renamed in workflow files, update required checks in rulesets.
- Emergency hotfix bypass should be explicit and documented in PR timeline.
