---
name: "competency-mapping"
description: "Map lessons to competencies and define mastery gates. Use when: designing competency progression, setting mastery thresholds, creating transfer tasks, verifying gating rules align with the PRD. Keywords: competency, mastery, gating, transfer task, evidence."
---

# Competency Mapping

Align lessons with competencies and author evidence-based mastery gates.

## What This Does

Helps you design the learning progression by mapping lessons to discrete competencies and defining what mastery means at each level.

Based on the PRD competency model:

- **Aware**: Recognizes concept, knows terminology
- **Assisted**: Can complete tasks with guidance
- **Functional**: Can complete standard tasks reliably
- **Independent**: Can adapt skill in new contexts without step-by-step help

## Typical Workflow

1. **Identify the competency** — Which core skill does this lesson teach? (e.g., "File Navigation", "Git Branching")
2. **Map the lesson** — Link the lesson to the competency domain and level.
3. **Define transfer evidence** — What does independent mastery look like? Create a reduced-guidance task.
4. **Set gates** — Require learners to pass the transfer task before advancing to content that depends on this competency.
5. **Verify alignment** — Confirm gating rules match the PRD phase structure.

## Interface

- Read from `data/curriculum.ts` for existing competency mappings.
- Reference `lib/competency-engine.ts` for mastery level logic.
- Check `lib/progression-engine.ts` for gating rules and exit criteria.
- Inspect `lib/competency-engine.test.ts` for precedent and validation patterns.

## Core Competency Domains (from PRD)

- System Navigation
- Terminal Operation
- File Manipulation
- Automation
- Programming Logic
- Code Reading
- Debugging
- Configuration and Environments
- API Interaction
- Version Control
- Testing
- Documentation
- Independent Problem Solving

## Key Questions

- Which competency level should unlock which content?
- What evidence proves the learner has achieved each level?
- What does the transfer task look like?
- Can learners reach mastery in the suggested order (Aware → Assisted → Functional → Independent)?
- Does gating prevent advancement before prerequisites are solid?

## Output

Competency mappings that:

- Are explicit and measurable
- Align lessons to progression phases
- Gate advancement on evidence
- Create clear learning pathways
