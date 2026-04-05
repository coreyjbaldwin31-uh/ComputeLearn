# Curriculum Audit Results

## Completed Fixes

### P0 Fixes (Teach-Before-Test Violations) — ALL RESOLVED

1. **lesson-filesystem** transfer task: Removed `"find"` and `"where"` from acceptedAnswers — commands never taught
2. **lesson-system-inspection**: Removed pipe chain (`| Sort-Object CPU -Descending | Select-Object -First 5`) from explanation and demonstration — piping not yet taught. Replaced with plain `Get-Process` output reading + forward reference
3. **lesson-search-files**: Removed `Where-Object` paragraph from explanation[3] and demonstration[2] — Where-Object not yet taught. Added brief pipe introduction for `|` since it's essential for `Get-ChildItem | Select-String` composition
4. **lesson-docker-basics** transfer task: Removed `"inspect"`, `"port"`, `"exec"` from acceptedAnswers — commands taught in the lesson are only pull/run/ps/logs/stop/rm

### P1 Fixes (Content Quality) — 4 RESOLVED

1. **lesson-git-merge-conflict**: Added `git merge --abort` escape hatch explanation — critical safety info
2. **lesson-dockerfile**: Fixed objective from "multi-stage Dockerfile" to match actual content (single-stage with proper layering)
3. **lesson-ai-verification**: Added concrete hallucination example (`users.findFirst()` vs `users.find()`)
4. **lesson-json-config**: Added unquoted keys and single-quoted strings as additional JSON error examples

## Verified Non-Issues (False Positives from Sub-Agent)

- lesson-programming-logic P0 (TypeScript types) — DISPROVEN: lesson teaches types in its own explanation
- lesson-postman-basics P1 (assertion syntax) — DISPROVEN: demonstration shows pm.test/pm.response/pm.expect
- lesson-automated-testing P1 (Vitest syntax) — DISPROVEN: lesson teaches describe/it/expect in its own explanation
- lesson-git-workflow-advanced P1 (missing output demos) — DISPROVEN: demonstration shows git log --oneline output
- lesson-crud-app P0 (REST conventions) — DISPROVEN: explanation[2] teaches REST endpoint mapping
- lesson-piping-filtering P0 (Where-Object before taught) — NONSENSICAL: this IS the lesson that teaches Where-Object

## Remaining P2 Items (Future Consideration)

- Exercise acceptedAnswers are intentionally broad for free-form responses; could be tightened for some transfer tasks
- Some lessons could benefit from additional code exercises
- lesson-filesystem: Could explicitly name absolute vs relative paths
- lesson-project-structure: Could explain why node_modules goes in .gitignore
- lesson-package-management: "Transitive dependencies" used without deep explanation

## Validation

- TypeScript: clean (no errors)
- Lint: clean (no warnings)
- Tests: 491 passed (56 files)
- Build: succeeds
