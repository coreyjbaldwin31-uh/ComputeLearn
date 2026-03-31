## Plan: ComputeLearn Delivery Hardening

This plan turns ComputeLearn from strong curriculum shell into production-grade mastery platform by prioritizing PRD-critical capabilities first (validation engine, lab state control, competency gating), then layering quality, CI/CD, Docker, and governance. It uses strict branch protection and a disciplined branching model optimized for reliability and long-term scalability.

**Execution Model**

1. Branch strategy decision: use GitFlow-lite for functionality and release control, not ease.
2. Governance baseline: strict branch protection on main from day one, with required checks and review.
3. Delivery rhythm: short feature branches, PR-first workflow, mandatory CI, weekly hardening pass.
4. Scope priority: PRD Must items before Should and Later items.

**Phases and Steps**

1. Phase 0: Governance and Control Plane (blocks all later phases)
2. Step 0.1: Create long-lived branches and policy map: main, develop, release/_, hotfix/_, feature/\* conventions.
3. Step 0.2: Apply strict protection to main and develop: require PR, 1 review, required checks, up-to-date branch, no force push, no direct push.
4. Step 0.3: Add contributor workflow and merge policy documentation so every PR follows same quality gates.
5. Step 0.4: Define repository labels and PR templates for feature, bugfix, refactor, infra, and curriculum changes.
6. Step 0.5: Add required CODEOWNERS coverage for all critical paths and CI files.
7. Phase 1: PRD Must-Critical Learning Engine (depends on Phase 0)
8. Step 1.1: Implement formal validator contract and engine adapters for answer, file-state, command-output, and behavior/test criteria.
9. Step 1.2: Convert lesson completion from completion-click model to evidence-gated model with competency and transfer requirements.
10. Step 1.3: Add lab reset and replay as first-class actions with deterministic state snapshots and attempt traceability.
11. Step 1.4: Integrate code exercises into lesson flow with attempt artifacts and validator output mapping.
12. Step 1.5: Add milestone-level gates per phase so progression cannot bypass core competency thresholds.
13. Phase 2: Architecture Refactor for Scale (parallel with late Phase 1 after Step 1.2 is stable)
14. Step 2.1: Extract business logic from UI into testable modules (validation, mastery, spaced repetition, gating).
15. Step 2.2: Split large orchestration component into focused hooks and presentation components.
16. Step 2.3: Reduce curriculum monolith risk by modularizing phase content and adding schema-level validation.
17. Step 2.4: Add local persistence resilience for quota failures, parse failures, and migration-safe versioning.
18. Phase 3: Test and Quality System (starts after Step 1.1 and Step 2.1)
19. Step 3.1: Add automated test framework and baseline coverage policy.
20. Step 3.2: Write unit tests for validator rules, mastery thresholds, review scheduling, and gate evaluation.
21. Step 3.3: Add integration tests for lesson completion gating, transfer tasks, and reset/replay behavior.
22. Step 3.4: Add component tests for key learner flows (exercise validation, transfer feedback, phase advancement).
23. Step 3.5: Introduce regression suite for curriculum integrity and type-safe data constraints.
24. Phase 4: Docker and Environment Parity (parallel with Phase 3)
25. Step 4.1: Add production-grade Dockerfile for Next.js app with multi-stage build and minimal runtime image.
26. Step 4.2: Add local docker-compose workflow for reproducible dev startup and CI parity.
27. Step 4.3: Add CI Docker build job as required check to catch containerization regressions.
28. Step 4.4: Add security and image hygiene checks (base image pinning, vulnerability scan, layer hygiene).
29. Phase 5: CI/CD Expansion and Operational Guardrails (depends on Phase 3)
30. Step 5.1: Extend CI checks: lint, type-check, test, build, Docker build, curriculum validation.
31. Step 5.2: Add required status-check matrix for main and develop.
32. Step 5.3: Add release branch workflow and hotfix fast-track workflow with audit trail.
33. Step 5.4: Add preview deploy pipeline for PR validation and manual acceptance checks.
34. Step 5.5: Add failure triage policy and ownership map so broken pipeline has immediate responder.
35. Phase 6: Product Completion Waves (depends on Phases 1, 3, 5)
36. Wave 6A: Guided debugging inspect mode, diff view, layered hints tied to skill gaps.
37. Wave 6B: Evidence browser and exportable artifact history for portfolio readiness.
38. Wave 6C: Competency dashboard and transfer performance analytics aligned with PRD metrics.
39. Wave 6D: Independent-capability hardening for Phase 4 outcomes and capstone readiness.

**Parallelism and Dependencies**

1. Phase 0 blocks everything.
2. Phase 1 Step 1.1 is the key dependency for Phases 3 and 5 quality checks.
3. Phase 2 can begin once Phase 1 Step 1.2 is stable.
4. Phase 4 runs in parallel with Phase 3 after CI baseline exists.
5. Phase 6 begins only after gating, tests, and CI checks are reliable.

**Tooling Plan (What will be used and when)**

1. Source control and governance tools
2. Use git branch and non-interactive git commands for branch creation, flow control, and release/hotfix handling.
3. Use GitHub repository settings for branch rulesets and protection (manual setup by you, with exact values provided by me).
4. Use CODEOWNERS and PR templates for review enforcement.
5. Build, lint, and test tools
6. Use npm scripts for lint, build, type-check, and test automation.
7. Use ESLint and TypeScript checks as mandatory gates.
8. Add testing toolchain for unit, integration, and component verification.
9. Container tools
10. Use Docker multi-stage builds for production images.
11. Use docker compose for local parity and reproducible environments.
12. Use CI container build checks as required status checks.
13. CI/CD tools
14. Use GitHub Actions for all checks and release workflows.
15. Add artifact upload and optional preview deployment for PR validation.
16. Codebase analysis and planning tools
17. Use repository search and symbol analysis to track refactor impact and dependency hotspots.
18. Use issue and PR tooling for scoped work slicing and progress reporting.

**Branch and Rule Operations Plan**

1. Immediate branch setup
2. Create develop from main.
3. Use feature branches off develop for all implementation.
4. Use release branches from develop for stabilization and merge to main.
5. Use hotfix branches from main for production fixes.
6. Required protection set for main and develop
7. Require pull requests.
8. Require at least one approval.
9. Require all mandatory checks to pass.
10. Require branch to be up to date before merge.
11. Disable force pushes and deletion.
12. Optional temporary owner bypass only for emergency hotfix.
13. Required check set evolution
14. Initial required checks: lint and build.
15. After test framework lands: add test and type-check.
16. After Docker lands: add docker-build.

**Definition of Done by Phase**

1. Phase 0 done when branch rules and workflow governance are active.
2. Phase 1 done when completion requires validated evidence and transfer gates.
3. Phase 2 done when core logic is module-based and monolith risks are reduced.
4. Phase 3 done when critical logic has automated tests and threshold coverage.
5. Phase 4 done when local and CI Docker paths are stable.
6. Phase 5 done when CI/CD gates are comprehensive and enforced.
7. Phase 6 done when PRD Must and Should outcomes are operationally measurable.

**Relevant files**

- c:/Users/corey/ComputeLearn/PRD.md — product authority for scope, priorities, and acceptance intent.
- c:/Users/corey/ComputeLearn/components/training-platform.tsx — current orchestration hotspot and core refactor target.
- c:/Users/corey/ComputeLearn/data/curriculum.ts — curriculum, competency, exit standard, and assessment schema source.
- c:/Users/corey/ComputeLearn/components/terminal-simulator.tsx — lab simulation baseline for reset/replay expansion.
- c:/Users/corey/ComputeLearn/components/code-exercise.tsx — code exercise surface to fully integrate with validator/attempt system.
- c:/Users/corey/ComputeLearn/.github/workflows/ci.yml — CI expansion anchor and required-check source.
- c:/Users/corey/ComputeLearn/.github/CODEOWNERS — ownership and review enforcement anchor.
- c:/Users/corey/ComputeLearn/.github/pull_request_template.md — mandatory PR evidence checklist anchor.
- c:/Users/corey/ComputeLearn/package.json — scripts and quality gate commands.
- c:/Users/corey/ComputeLearn/README.md — contributor and workflow documentation entry point.

**Verification**

1. Governance verification: confirm branch protection active on main and develop, with enforced required checks and review policy.
2. CI verification: all required checks green on a feature PR before merge.
3. Validator verification: pass/fail outputs include failed criteria and actionable hint mapping.
4. Gating verification: cannot mark lesson complete without required transfer and competency evidence.
5. Lab verification: reset restores baseline state, replay reproduces attempt sequence deterministically.
6. Test verification: threshold met for critical logic and integration paths.
7. Docker verification: local compose startup succeeds and CI image build passes.
8. Release verification: release branch merges cleanly to main with unchanged required checks.

**Decisions**

1. Optimize for strongest long-term functionality over easiest workflow.
2. Use strict protection posture immediately.
3. Include Docker for both local development and CI.
4. Provide you explicit step-by-step GitHub rule configuration since you requested guided setup.
5. Prioritize PRD Must capabilities before broad feature expansion.

**Further Considerations**

1. Branch strategy alternatives considered: GitHub Flow and Trunk-based. Recommendation remains GitFlow-lite due to stronger release and hotfix control while feature surface is expanding quickly.
2. Deployment platform remains open. Recommendation: keep provider-agnostic CI first, then connect preview and production once test reliability is stable.
3. If any GitHub admin setting is blocked, fallback is policy-by-convention plus CI checks, then promote to enforced rules once access is available.
