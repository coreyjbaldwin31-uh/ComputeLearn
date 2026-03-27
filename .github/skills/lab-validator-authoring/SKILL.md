---
name: "lab-validator-authoring"
description: "Design and test lab validators. Use when: creating validation rules for lessons, testing validators against sample attempts, troubleshooting validation failures, generating hint guidance for failed checks. Keywords: validator, lab, validation rule, evidence, gating."
---

# Lab Validator Authoring

Author, test, and validate evidence-gating rules for ComputeLearn labs.

## What This Does

Helps you write and debug validators that check learner attempt correctness. Validators are the core mechanism for gating lesson progression — they define what "complete" means for each lab.

## Typical Workflow

1. **Plan the validation rule** — What evidence proves the learner succeeded? File presence? Command output matching? Test pass? Code behavior?
2. **Write the validator** — YAML rule with condition, expected result, failure hint.
3. **Test against samples** — Create mock attempt data and verify the validator passes/fails correctly.
4. **Troubleshoot failures** — Inspect validator logic and test cases until behavior matches intent.
5. **Generate hints** — Map validator failures to skill gaps and craft escalating hint guidance.

## Interface

- Read from `lib/validation-engine.ts` to understand the validator contract.
- Inspect sample validators in `data/curriculum.ts` under `validationRules` or `validationMode`.
- Write new validators in YAML or TypeScript following existing patterns.
- Use `lib/validation-engine.test.ts` as the test reference for validator behavior.

## Key Questions

- What does a correct attempt look like for this lab?
- What are the most common failure modes learners hit?
- How should the validator hint guide them toward the right answer?
- Are there edge cases (empty input, wrong type, off-by-one)?

## Output

Well-tested validators that:

- Are specific and unambiguous
- Fail fast on clearly wrong attempts
- Guide learners toward the right answer via hints
- Scale as the curriculum expands
