---
name: "newman-api-test-suite"
description: "Define and run API test collections with Newman. Use when: testing platform endpoints, validating request/response contracts, checking error handling, verifying API behavior matches specs. Keywords: API, testing, Newman, HTTP, validation, endpoint."
---

# Newman API Test Suite

Author and execute API test collections to validate platform endpoints.

## What This Does

Uses Newman (Postman's CLI runner) to define, run, and validate API test collections:

- Request/response contract validation
- Error handling and status code verification
- Header and body assertion
- Environment variable injection
- Pre/post-request scripting for complex flows

## Typical Workflow

1. **Define endpoints** — List the API routes that need testing (endpoints for learner state, progress, artifacts, validation).
2. **Write collection** — Create a Postman/Newman JSON collection with request sets.
3. **Add assertions** — Validate response status, body structure, and key fields.
4. **Run tests** — Execute with Newman and check results.
5. **Debug failures** — Inspect request/response to understand what broke.

## Interface

- Read from `app/` and component props to understand the API surface.
- Reference `Next.js` app router structure for endpoint location.
- Use `newman run <collection.json>` to execute tests.
- Store collections in `.github/api-tests/` for version control.

## Collection Structure

```json
{
  "info": { "name": "ComputeLearn API", "version": "1.0" },
  "item": [
    {
      "name": "Get Learner Profile",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/learner/:id"
      },
      "test": [
        "pm.response.to.have.status(200)",
        "pm.expect(pm.response.json().id).to.exist"
      ]
    }
  ]
}
```

## Key Areas to Test

- Learner state endpoints (read/write progress, notes, reflections)
- Lesson progression (fetch lesson, mark complete, check gating)
- Artifact endpoints (fetch, export, list history)
- Validation endpoints (run validator, return error details)
- Competency endpoints (fetch mastery level, check prerequisites)

## Key Questions

- What requests should the API accept?
- What responses should it return (structure and status)?
- How should it handle errors (invalid input, missing resources)?
- What headers are required (auth, content-type)?
- Are responses consistent across learner context?

## Output

Test collection and results showing:

- ✓ All endpoints return expected responses
- ✗ Failed assertions with details for debugging
- Execution summary (tests run, passed, failed, duration)
