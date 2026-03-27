---
name: "Curriculum Integrity Check"
description: "Validate curriculum.ts schema and structural integrity. Use when: preparing curriculum for merge, auditing for broken references, catching duplicate IDs, verifying competency mappings, ensuring all phases are complete. Keywords: curriculum, schema, validation, integrity, structure."
---

# Curriculum Integrity Check

Audit the curriculum for structural errors and gaps before merge.

## What This Does

Validates the entire curriculum.ts against schema rules and structural constraints:
- No duplicate lesson, course, or phase IDs
- All competencies referenced in lessons exist in the framework
- Milestones are properly linked to phases and competencies
- Exit criteria exist for all phases and are reachable
- No orphaned lesson references (lessons that exist but are never included in any course)
- Transfer tasks reference lessons that have corresponding evidence types
- Competency levels progress logically (Aware → Assisted → Functional → Independent)
- All phases include at least one course with at least one lesson

## Typical Workflow

1. **Run audit** — Check curriculum for all structural errors.
2. **Review findings** — Understand what's broken and why it matters.
3. **Fix errors** — Update curriculum.ts to resolve structural issues.
4. **Re-verify** — Confirm all checks pass before committing.

## Interface

- Read from `data/curriculum.ts` to inspect the full curriculum structure.
- Reference `lib/progression-engine.ts` and `lib/competency-engine.ts` for how the curriculum is used.
- Check `lib/competency-engine.test.ts` and `lib/progression-engine.test.ts` for validation patterns.

## Key Checks

- Duplicate ID detection (phases, courses, lessons, competencies, milestones)
- Reference integrity (all referenced items exist)
- Structural completeness (all phases are defined, have courses, have lessons)
- Competency alignment (lessons map to defined competencies)
- Exit criteria reachability (can be satisfied with achievable thresholds)
- Phase progression (each phase builds on the previous)

## Output

A report showing:
- ✓ All checks passed or
- ✗ List of errors with location and remediation guidance
