---
name: "regression-test-add"
description: "Add focused regression tests after a bug fix or defect investigation. Use when: a bug has been fixed and the repository needs a durable test that prevents recurrence. Keywords: regression, test, bug fix, defect, prevent recurrence, edge case, guard, test coverage."
---

# Regression Test Addition

Add a focused, durable test that proves a bug is fixed and would fail if the bug were reintroduced.

## When to Use

- After fixing a bug or defect
- After investigating a production issue
- After fixing a flaky behavior that was previously untested
- When a code review identifies a missing edge case test
- When `verify-fast` or `verify-full` exposed a gap in test coverage for a specific scenario

## Required Context

1. **Read `PRD.md`** if it exists — understand whether the bug relates to an acceptance criterion.
2. **Read `README.md`** if it exists — identify the test command and framework.
3. **Read `package.json` scripts** — confirm the test runner and available commands.
4. **Read the fix** — understand what changed and why.
5. **Read existing tests** in the same area — follow established patterns for naming, structure, assertions, and mocking.
6. Do not create `docs/plan.md` or any duplicate primary planning document.

## Procedure

### Step 1 — Document the Bug

Before writing the test, capture:

| Field | Description |
|-------|------------|
| **Bug** | One-sentence description of the defect |
| **User-visible failure** | What the user or system experienced |
| **Root cause** | What code path or condition caused it (if known) |
| **Fix** | What was changed to resolve it |
| **Affected boundary** | Which module, function, or component was involved |

This information drives test design. If the root cause is unclear, the test should target the observable failure behavior.

### Step 2 — Choose the Test Layer

Pick the narrowest layer that meaningfully guards the defect:

| Layer | Use When | Example |
|-------|----------|---------|
| **Unit** | Bug is in a pure function or isolated module | Validation logic returns wrong result |
| **Integration** | Bug involves interaction between modules | Engine produces wrong output when called from component |
| **API** | Bug is in request handling, routing, or response shape | Endpoint returns 500 instead of 400 |
| **UI / Component** | Bug is in rendering, user interaction, or state | Button disabled when it should be enabled |
| **End-to-end** | Bug spans multiple layers or is only visible in full flow | Form submission silently fails |

Prefer unit or integration tests. Only use higher layers when the bug genuinely requires them.

### Step 3 — Identify Test Scenarios

Every regression test needs at minimum:

1. **Primary regression path** — the exact scenario that triggered the bug, with the exact input or state that caused the failure.

Optionally add:

2. **Boundary edge case** — a related input that is near the failure boundary (e.g., off-by-one, empty input, null, maximum value).

Do not add more scenarios unless they guard genuinely different failure modes. One strong regression test is better than five weak ones.

### Step 4 — Write the Test

Follow the repo's existing test conventions. Determine these by reading nearby test files:

| Convention | Look For |
|-----------|----------|
| **Framework** | `vitest`, `jest`, `pytest`, etc. |
| **File naming** | `*.test.ts`, `*.spec.ts`, `__tests__/` |
| **Describe/it style** | Nested `describe` blocks vs flat `test` calls |
| **Assertion library** | `expect`, `assert`, `chai` |
| **Mocking** | `vi.mock`, `jest.mock`, manual stubs |
| **Fixtures** | Inline data, factory functions, fixture files |
| **Naming** | What verb tense, what detail level |

Structure the test:

```typescript
describe('<module or function>', () => {
  it('should <expected behavior> when <condition that caused the bug>', () => {
    // Arrange — set up the exact state that triggered the bug
    // Act — call the function or trigger the behavior
    // Assert — verify the correct behavior (not the old buggy behavior)
  });
});
```

**Test naming guidance:**
- Name describes the correct behavior, not the bug
- Include the triggering condition
- Example: `"should return empty array when input contains no valid entries"` not `"fix bug #42"`

### Step 5 — Verify the Test Guards the Defect

The test must satisfy two conditions:

1. **Passes with the fix applied** — run the test and confirm it passes.
2. **Would fail without the fix** — mentally verify (or temporarily revert) that the test would catch the original bug.

If the test passes regardless of whether the fix is present, it does not guard the defect. Rewrite it.

### Step 6 — Run and Record

Run the new test in isolation:

```
npx vitest run <test-file> --reporter=verbose
```

Then run the full test suite to confirm no interference:

```
npx vitest run
```

Record:
- Exact command to run the new test
- Pass/fail result
- Total test count before and after (if easy to check)

## Output Format

```
## Regression Covered

### Bug Summary
- Bug: [one-sentence description]
- User-visible failure: [what was observed]
- Root cause: [what caused it]
- Fix: [what was changed]

### Test Added
- File: [path to test file]
- Test name: [describe/it text]
- Layer: [unit | integration | API | UI | e2e]
- Scenarios: [primary regression path + any edge cases]

### Verification
| Check | Command | Result |
|-------|---------|--------|
| New test passes | `npx vitest run <file>` | pass/fail |
| Full suite passes | `npx vitest run` | pass/fail |

### What Is Now Protected
[One paragraph explaining what scenario is guarded and how the test would catch recurrence.]

### Remaining Gaps
[Any related scenarios that are still untested, or "None identified."]
```

## Rules

- Do not inflate test count with weak assertions. One assertion that proves the behavior is better than five that check tangential details.
- Do not test private internals when behavior-level testing is sufficient. Test the public interface.
- Do not write tests that pass regardless of the fix. The test must meaningfully guard the observed defect.
- Do not change the test framework or conventions. Follow the existing patterns.
- Keep tests deterministic. No reliance on timing, random data, or external services.
- Keep tests behavior-focused. Assert what the code does, not how it does it.
- End with a section titled **"Regression Covered"** documenting the bug, the test, and what is now protected.
