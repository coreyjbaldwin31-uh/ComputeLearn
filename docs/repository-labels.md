# Repository Label Taxonomy

Use these labels consistently across issues and pull requests.

## Type labels

- `type:feature` - New user-facing behavior or capability.
- `type:bug` - Broken behavior, regression, or incorrect output.
- `type:refactor` - Internal code structure changes without intended behavior change.
- `type:infra` - Tooling, CI/CD, Docker, repository settings, and workflow changes.
- `type:curriculum` - Curriculum content, sequencing, competency, and assessment updates.

## Priority labels

- `priority:p0` - Immediate work; blocks release quality or critical workflow.
- `priority:p1` - High-priority near-term work.
- `priority:p2` - Important, but not urgent.
- `priority:p3` - Backlog or low urgency.

## Phase alignment labels

- `phase:0-governance`
- `phase:1-learning-engine`
- `phase:2-architecture`
- `phase:3-quality`
- `phase:4-docker`
- `phase:5-ci-cd`
- `phase:6-product-waves`

## Example CLI setup

If GitHub CLI is installed and authenticated:

```bash
gh label create "type:feature" --color "0E8A16" --description "New user-facing behavior"
gh label create "type:bug" --color "D73A4A" --description "Broken behavior or regression"
gh label create "type:refactor" --color "5319E7" --description "Internal structure improvement"
gh label create "type:infra" --color "1D76DB" --description "CI/CD, Docker, and repository workflow"
gh label create "type:curriculum" --color "FBCA04" --description "Learning content and competency changes"
```
