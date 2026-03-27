---
name: "artifact-analytics"
description: "Analyze learner artifacts and attempt patterns. Use when: understanding learner outcomes, identifying repeated errors, diagnosing skill gaps, generating summary reports on learning progress. Keywords: artifact, analytics, learner outcome, error pattern, evidence."
---

# Artifact Analytics

Analyze saved learner work and attempt history to understand learning outcomes.

## What This Does

Mines artifact and attempt data to reveal patterns:

- Which lessons have the highest failure rate?
- What errors do learners repeat across attempts?
- Which competencies show weakest mastery?
- How does attempt count correlate with final success?
- What skill gaps are most common at each phase?

## Typical Workflow

1. **Inspect artifacts** — Browse saved learner work (code, notes, diffs, scripts).
2. **Analyze attempt history** — Count failures, time between attempts, error types.
3. **Identify patterns** — Spot repeated errors, skill gaps, bottleneck lessons.
4. **Generate report** — Summarize findings for curriculum improvement or learner guidance.

## Interface

- Read from artifact and attempt data in learner state.
- Reference `lib/artifact-engine.ts` and `lib/attempt-analytics-engine.ts` for data access.
- Check `lib/artifact-browser-engine.ts` for artifact browsing patterns.
- Inspect test data in `lib/*.test.ts` files for sample artifact structures.

## Types of Analysis

**Learner-level:**

- Total attempts by lesson
- Pass rate by phase
- Time to mastery per competency
- Error frequency and types

**Curriculum-level:**

- Lesson difficulty (pass rate distribution)
- Competency bottlenecks (where most learners struggle)
- Phase progression rate (how many advance to next phase?)
- Transfer task performance vs. guided task performance

**Error pattern detection:**

- Same error across attempts (indicates misunderstanding)
- Different errors (indicates exploration or luck)
- Off-by-one errors, type mismatches, logic errors

## Key Questions

- Which lessons need curriculum redesign (too hard or too simple)?
- Where do learner skill gaps cluster?
- Do transfer tasks accurately predict independent capability?
- Is the progression order optimal?
- What hints are most effective for each failure mode?

## Output

Reports showing:

- Learner outcome summaries
- Skill gap distribution
- Lesson difficulty and effectiveness
- Actionable curriculum improvement recommendations
