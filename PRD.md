# ComputeLearn — Product Requirements Document

**Founder-style Product Requirements Document**
Version 1.0 | Prepared for product planning and implementation alignment

---

## Contents

1. [Product vision and positioning](#1-product-vision-and-positioning)
2. [User, problem, and opportunity](#2-user-problem-and-opportunity)
3. [Product principles](#3-product-principles)
4. [Learning architecture and curriculum](#4-learning-architecture-and-curriculum)
5. [Competency model and mastery gates](#5-competency-model-and-mastery-gates)
6. [Lab system and assessment model](#6-lab-system-and-assessment-model)
7. [Product scope and MVP definition](#7-product-scope-and-mvp-definition)
8. [Technical architecture direction](#8-technical-architecture-direction)
9. [Roadmap, metrics, and risks](#9-roadmap-metrics-and-risks)

---

## At a Glance

| Field | Detail |
| --- | --- |
| **Product** | Mastery-based learning platform for turning everyday computer users into technically fluent builders. |
| **Core promise** | Learners progress by operating real tools inside safe, reversible labs instead of consuming passive lessons. |
| **Primary outcome** | Practical entry-level software engineering competence across system use, coding, debugging, Git, testing, and delivery workflow. |
| **Current baseline** | Next.js 16 App Router, React 19, TypeScript 5, multi-page academy shell with 14 routes, 4-step lesson flow, 15 domain engines, 38 lab templates, 55 test files (471 tests), Docker build, Sentry + OTel instrumentation, localStorage persistence. |

> **Executive framing:** The current concept is strong, but it becomes significantly more investable and buildable once the end state, competency gates, lab engine, and capstone path are made explicit. This document reframes ComputeLearn as a training system for engineering behavior, not only a content platform.

---

## 1. Product Vision and Positioning

ComputeLearn is a hands-on engineering learning platform that takes users from average computer use to practical entry-level software engineering competence through guided labs, reversible environments, structured debugging, and project-based progression.

The product should not behave like a video course, a documentation mirror, or an answer engine. Its value comes from repeatedly putting learners in realistic task loops where they must inspect state, make changes, run tools, interpret feedback, recover from errors, and verify outcomes.

**The clearest positioning is this: ComputeLearn trains software engineering behavior. It does not merely teach about software engineering.**

### Product Thesis

Most beginner learning products teach concepts out of context. Real confidence appears later, when the learner must use files, terminals, editors, packages, APIs, logs, tests, and Git together inside a real workflow. ComputeLearn closes that gap by making operational fluency the front door to engineering skill.

### Strategic Positioning Statement

> ComputeLearn is a mastery-based learning platform that teaches people to operate computers, codebases, and engineering workflows through safe labs, real debugging, and guided project work.

---

## 2. User, Problem, and Opportunity

### Primary User

The primary user is an everyday computer user who is comfortable browsing, installing software, and using common applications but lacks deep confidence with the filesystem, terminal, code, debugging, and development tooling.

**Typical starting profile:**

- Uses a computer daily but relies on trial and error when something breaks
- Has little or no terminal experience
- May have tried coding tutorials but struggles to apply them in real environments
- Feels intimidated by errors, configuration files, or development tools
- Wants practical competence, not abstract theory alone

### Secondary User

A learner with basic coding exposure who can write syntax-level code but lacks workflow discipline, system understanding, debugging habits, or project execution confidence.

### Core Problem

New learners often fail in the transition from concept learning to system operation. They may know what a variable or API is, yet still cannot find files, understand paths, fix environment issues, read an error trace, use Git safely, or complete a scoped task from start to finish.

### Product Opportunity

A strong learning system can own this transition by treating operational fluency, debugging, and workflow discipline as first-class skills instead of assuming they appear automatically once someone starts coding.

---

## 3. Product Principles

| Principle | Definition |
| --- | --- |
| **Learning by doing** | Every concept should connect directly to an action. Explanations support execution instead of replacing it. |
| **Safe failure** | Learners need isolated workspaces, reset actions, and replayable labs so failure becomes useful rather than discouraging. |
| **Mastery over completion** | Progress should be based on demonstrated capability, not only lesson completion or time spent. |
| **Real workflows** | The platform should teach authentic tasks such as inspecting files, editing code, tracing errors, running tests, and validating outcomes. |
| **Gradual release** | Early labs can be guided, but support should reduce over time until the learner can work independently. |
| **Signal before theory** | The platform should show outputs, errors, diffs, and visible state first, then explain what those signals mean. |

---

## 4. Learning Architecture and Curriculum

ComputeLearn should be organized as a staged progression from machine control to independent engineering work. The current three-phase direction is sound, but the strongest version adds a fourth phase that proves independent capability.

### Phase Structure

| Stage | Title | Primary Goal | Representative Content |
| --- | --- | --- | --- |
| **Phase 1** | Computer and Tooling Mastery | Operate with confidence and control | Filesystem navigation, keyboard-first workflows, terminal basics, PowerShell, search, process awareness, simple automation, editor fluency |
| **Phase 2** | Programming and Debugging Foundations | Build mental models for software behavior | Variables, functions, types, runtime vs compile-time errors, package managers, configuration, JSON, APIs, code reading, small application structure |
| **Phase 3** | Engineering Workflow and Delivery | Execute scoped engineering work with discipline | Git, branches, diffs, testing, refactoring, bug triage, task decomposition, documentation, verification habits |
| **Phase 4** | Independent Build and Portfolio | Prove independent capability | Reduced-guidance projects, requirement interpretation, architecture tradeoffs, capstones, READMEs, handoff readiness, portfolio artifacts |

### End-State Definition

A learner should be considered successful only when they can independently complete a small engineering task end to end. That means understanding the task, locating the right files, making changes intentionally, running the system or tests, diagnosing failures, correcting issues, and documenting the result clearly.

### Why the Fourth Phase Matters

Without an explicit independent build phase, the platform risks creating learners who are good at guided labs but still struggle when support falls away. The capstone layer converts training progress into credible, demonstrable competence.

---

## 5. Competency Model and Mastery Gates

Curriculum flow alone is not enough. ComputeLearn should track discrete competencies and require evidence before advancing the learner into higher-complexity work.

### Core Competency Domains

| Column A | Column B |
| --- | --- |
| System Navigation | Configuration and Environments |
| Terminal Operation | API Interaction |
| File Manipulation | Version Control |
| Automation | Testing |
| Programming Logic | Documentation |
| Code Reading | Independent Problem Solving |
| Debugging | Delivery Workflow |
| Security Awareness | |

### Mastery Ladder

| Level | Definition |
| --- | --- |
| **Aware** | Recognizes the concept and basic terminology |
| **Assisted** | Can complete tasks with structured guidance |
| **Functional** | Can complete standard tasks reliably |
| **Independent** | Can adapt the skill in new contexts without step-by-step help |

### Mastery Gate Rule

> Learners should not advance by merely opening lessons or finishing a walkthrough. Promotion requires evidence from **action correctness**, **reasoning quality**, **debugging accuracy**, and **transfer performance**.

---

## 6. Lab System and Assessment Model

**The lab engine is the product.** ComputeLearn becomes compelling when labs feel safe, inspectable, and progressively more realistic.

### Required Lab Capabilities

- Isolated workspace state with a known starting baseline
- Reset, replay, and inspect actions on every meaningful lab
- Validation against expected file state, command output, behavior, or tests
- Hints that escalate in layers rather than revealing the entire answer immediately
- Artifact capture for scripts, notes, diffs, and project files
- Reduced scaffolding as the learner progresses

### Lab Difficulty Progression

| Level | Instruction Model | Purpose |
| --- | --- | --- |
| **Level 1** | Step-by-step execution | Used for first exposure and confidence building |
| **Level 2** | Goal-driven with hints | Learner chooses actions while retaining guided support |
| **Level 3** | Problem statement with partial scaffolding | Focus shifts toward debugging and reasoning |
| **Level 4** | Ticket-style task with minimal guidance | Used to approximate real engineering execution |

### Assessment Dimensions

| Dimension | Definition |
| --- | --- |
| **Action correctness** | Did the learner produce the required output, file state, code behavior, or system result? |
| **Reasoning quality** | Can the learner explain why the result worked? |
| **Debugging accuracy** | Can the learner identify the root issue instead of reacting only to symptoms? |
| **Transfer ability** | Can the learner solve a related problem with less support? |

---

## 7. Product Scope and MVP Definition

The MVP should prove that ComputeLearn materially improves learner capability through structured labs. It should not try to solve every future feature in the first version.

### MVP Build Priorities

| Priority | Category | Definition | Status |
| --- | --- | --- | --- |
| **Must** | Core platform shell | Curriculum navigation, learner profile, local progress persistence, notes, and milestone gating | ✅ Done |
| **Must** | Lab engine | Workspace template model, reset/replay, validation rules, and completion evidence | ✅ Done |
| **Must** | Phase 1 excellence | Filesystem, terminal, search/filtering, automation basics, and workflow efficiency | ✅ Done — curriculum, lab templates, lab UI, terminal integration, code-behavior and test-pass UI all wired |
| **Must** | Academy platform architecture | Multi-page App Router shell with sidebar navigation, breadcrumbs, per-page routes, and dark-sidebar design system | ✅ Done |
| **Must** | Guided lesson flow | 4-step stepper (Learn → Practice → Apply → Reflect & Download) with concept gating and guided notes | ✅ Done |
| **Should** | Guided debugging | Error-focused labs, inspect mode, diff view, and layered hints | ✅ Done |
| **Should** | Retention system | Reflection prompts and spaced repetition tied to weak competencies | ✅ Done |
| **Should** | Cumulative review | Prerequisite review panel with weak-competency overlap detection and previous-lesson linking | ✅ Done |
| **Should** | Download & study | Markdown notes export and lab artifact export for offline study | ✅ Done |
| **Should** | Accessibility hardening | aria-pressed, aria-current, aria-label, role=group, prefers-reduced-motion support | ✅ Done |
| **Should** | Open learning model | Phases previewable without hard locks; "upcoming" label replaces "locked" state | ✅ Done |
| **Later** | AI review loop | Bounded support for explanation, critique, and next-step guidance | ⬚ Not started |
| **Later** | Advanced templates | More realistic bug sets, project scaffolds, and saved transcripts | ⬚ Not started |
| **Later** | Durable persistence | Server-backed or IndexedDB persistence with cross-device sync | ⬚ Not started |
| **Later** | Content quality pass | Deep lesson enrichment, pedagogical review, demonstration quality | ⬚ Not started |

### Recommended First-Release Modules

| Module | Content |
| --- | --- |
| **Filesystem Navigation** | Paths, relative vs absolute locations, listing contents, moving between directories, finding misplaced files |
| **File Operations** | Create, move, rename, copy, delete, extension awareness, safe bulk actions |
| **Terminal Confidence** | Command execution, parameters, command history, reading terminal feedback |
| **Search and Filtering** | Search files, inspect content, filter output, and use pipes |
| **Automation Basics** | Simple PowerShell scripts, variables, loops, and repeatable file actions |
| **Workflow Efficiency** | Keyboard shortcuts, launcher habits, note systems, and technical organization |

### What the MVP Should Prove

> A new learner can enter the platform with limited terminal confidence, navigate the multi-page academy, complete a structured Phase 1 path through the Learn → Practice → Apply → Reflect flow, pass validation-driven labs, export their study notes, succeed on at least one reduced-guidance transfer task, and leave with demonstrably stronger operational fluency.

---

## 8. Technical Architecture Direction

### Stack Summary

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16.2.1 (App Router, Turbopack) |
| **UI** | React 19, TypeScript 5 |
| **Testing** | Vitest 3.2.4, Testing Library, jsdom |
| **Observability** | Sentry SDK 10, OpenTelemetry via @vercel/otel |
| **Container** | Docker multi-stage build, Compose for local dev |
| **Persistence** | Browser localStorage (9 keys) |

### Application Layers

| Layer | Responsibility |
| --- | --- |
| **Application layer** | App Router routing, `(academy)` layout shell, learner state, navigation flow, and gating decisions |
| **Curriculum layer** | `data/curriculum.ts` — Phases, courses, lessons, competencies, milestones, and assessment rules |
| **Catalog layer** | `lib/learning-catalog.ts` — Course/lesson record lookups, assignment extraction |
| **Lab engine layer** | `lib/lab-engine.ts` — Workspace templates, resets, replays, validation, hints, artifacts, attempt tracking |
| **Engine library** | `lib/` — 15 engines covering progression, competency, reflection, reinforcement, artifacts, analytics, inspection, hints, milestones, outcomes, independent readiness |
| **Persistence layer** | `useLocalStorageState` hook — progress, notes, reflections, transfer, attempts, artifacts, lab instances, reviews, guided notes |
| **Lesson flow layer** | `components/lesson-flow.tsx` — 4-step guided stepper orchestrating all lesson subsystems |
| **Review layer** | Feedback presentation, reflections, and prerequisite review panel |

### Academy Platform Architecture

The platform uses a multi-page architecture via the `(academy)` route group:

| Route | Component | Purpose |
| --- | --- | --- |
| `/dashboard` | `LearnerDashboard` | Live stats, continue learning, due reviews, phase progress |
| `/courses` | Catalog page | Phase-grouped course listing |
| `/courses/[courseId]` | `AcademyBreadcrumbs` | Course detail with lesson sequence |
| `/lessons` | Library page | Full lesson listing with phase tags |
| `/lessons/[lessonId]` | `LessonFlow` | 4-step lesson experience (Learn → Practice → Apply → Reflect) |
| `/assignments` | Assignments page | Transfer task listing with source-lesson links |
| `/modules` | Module directory | Course-level module cards |
| `/modules/[courseId]` | Module detail | Per-module lesson path |
| `/progress` | `CompetencyTracker` | Competency levels, phase gates, assessment activity |

**Academy shell** (`academy-shell.tsx`): Persistent dark sidebar (#0c111d) with brand, `AcademyNav` (active state detection via `usePathname`), and program phase listing. Main content area beside sidebar.

**Lesson flow** (`lesson-flow.tsx`): Replaces old tabbed `LessonWorkspace`. Four sequential steps with stepper UI, concept gating (all concepts must be marked "understood" before Practice), guided notes persistence, download/export, and cumulative review.

### Minimum Data Model

At minimum, the platform represents **Learner**, **Phase**, **Course**, **Lesson**, **Lab**, **Attempt**, **CompetencyRecord**, and **Artifact** as first-class entities. That creates the backbone for gating, reflection, saved work, and later analytics.

### Validation Engine Contract

The validator checks file presence, directory structure, file content, command output, code behavior, and test pass conditions. Each result returns:

- pass or fail
- failed criteria
- probable skill gap
- optional hint guidance

**Implementation status:** All six validation rule kinds are implemented in `lib/lab-engine.ts` — `file-presence`, `directory-structure`, `content-match`, `command-output`, `code-behavior`, and `test-pass`. Each returns pass/fail, a human-readable message, and a probable skill gap string. Hint access is provided via `getLabHint()` with layered escalation.

### Design System

CSS design system in `globals.css` using `--ac-*` custom properties:

- Dark sidebar: `#0c111d`, content bg: `#f6f8fa`
- Accent: `#2563eb` (electric blue)
- Border radius: `3px` (sharp, not rounded)
- Component class namespaces: `lw-*`, `ld-*`, `ct-*`, `lf-*`, `gn-*`, `rp-*`
- `prefers-reduced-motion` respected via `usePrefersReducedMotion` hook

---

## 9. Roadmap, Metrics, and Risks

### Roadmap

> Status markers: ✅ done · 🔧 in progress · ⬚ not started

1. ✅ Define the competency graph for Phase 1 — 15 domains mapped across 37 lessons with mastery levels
2. ✅ Define the workspace and lab template model — lab-engine with template, instance, reset/replay, hints, artifact capture
3. ✅ Ship the validation engine contract — file-presence, directory-structure, content-match, command-output, code-behavior, test-pass rules
4. ✅ Create the first 10 high-value Phase 1 labs — 10 authored templates in `data/lab-templates.ts` covering all 9 lessons with 26 structural tests
5. ✅ Add milestone gating, reflections, and artifact saving — milestone-engine, reflection-engine, artifact-engine, export, and browser
6. ✅ Introduce guided debugging labs and inspect mode — inspection-engine, layered hints, diff-style output
7. ✅ Smoke-test full lab flow end to end — 4 end-to-end smoke tests added covering file-edit→validate round-trip, multi-attempt progression, full lifecycle, and file-edit isolation
8. ✅ Expand into Phase 2–4 once Phase 1 outcomes are visibly strong — Phase 2–4 curriculum authored; 38 lab templates across all 4 phases; all 15 engines wired
9. ✅ Build academy platform architecture — multi-page App Router with `(academy)` route group, sidebar shell, breadcrumbs, academy nav with active state, 14 routes compiling
10. ✅ Redesign lesson flow with pedagogical progression — 4-step stepper (Learn → Practice → Apply → Reflect & Download), guided notes with concept gating, cumulative review panel, download/export
11. ✅ Remove phase locking in favor of open learning model — "locked" state replaced with "upcoming" preview; all phases browsable
12. ✅ Accessibility hardening pass — aria-pressed, aria-current="step", aria-label on interactive controls, role="group" on filter rows, prefers-reduced-motion hook with scroll behavior
13. ✅ Add lesson entry cue and navigation polish — LessonEntryCue component, smooth scroll with motion preference, contextual messages on lesson transitions
14. ✅ Add new component and hook tests — action-bar, home-dashboard, progress-roadmap, rail-panels, sidebar-panels, lesson-entry-cue, use-prefers-reduced-motion test suites
15. ✅ Test coverage for new academy components — lesson-flow, guided-notes, lesson-review-panel, learning-catalog
16. ✅ Dead code cleanup — remove lesson-workspace.tsx (superseded by lesson-flow.tsx)
17. ⬚ Content quality pass — enrich lesson explanations, demonstrations, retention cues, and exercise prompts for pedagogical depth
18. ⬚ AI review loop — bounded support for explanation, critique, and next-step guidance (scoped to reflection step)
19. ⬚ Durable persistence — server-backed or IndexedDB persistence with backup/restore and cross-device sync
20. ⬚ CSS modularization — extract globals.css class-system namespaces into CSS modules or co-located files
21. ⬚ Independent readiness UI — dedicated route and wizard for the independent-readiness-engine assessment
22. ⬚ Advanced lab templates — realistic bug sets, seeded project scaffolds, saved transcripts
23. ⬚ Real workspace runtime — move from in-memory lab-engine to sandboxed runtime with real file I/O

### Primary Product Metrics

| Metric | Why It Matters |
| --- | --- |
| **Transfer-task pass rate** | Best single indicator of genuine learning instead of walkthrough completion |
| **Independent lab completion rate** | Measures whether support can be reduced without collapse |
| **Repeated error reduction** | Shows whether the platform actually repairs foundational weaknesses |
| **Milestone pass rate** | Tracks progression quality through gated curriculum |
| **Artifact completion rate** | Indicates whether learners leave with saved evidence of work |
| **Guided-notes completion rate** | Shows concept-level engagement before practice begins |
| **Download rate** | Indicates learner investment in studying offline |

### Key Risks and Mitigation

| Risk | Mitigation |
| --- | --- |
| Too much explanation, not enough execution | Keep concept blocks short and lab-first |
| Labs feel toy-like or artificial | Model realistic tasks and authentic failure modes |
| Progress becomes completion-based | Require transfer evidence and competency gates |
| AI makes learners dependent | Constrain AI to guidance, critique, and reflection support |
| Scope expands too early | Make Phase 1 and the lab engine excellent before broad expansion |
| localStorage limitations | Implement export/backup as interim; plan IndexedDB or server persistence |
| CSS maintenance burden | Plan CSS module extraction as the class-system count grows |
| Dead code accumulation | Schedule cleanup of superseded components |

---

## 10. Forward Task Plan

### Immediate Priority

| ID | Task | Status |
| --- | --- | --- |
| T1 | Add tests for `lesson-flow.tsx` — step navigation, concept gating, download triggers | ✅ |
| T2 | Add tests for `guided-notes.tsx` — note input, checkbox, progress bar | ✅ |
| T3 | Add tests for `lesson-review-panel.tsx` — incomplete display, weak-track badge, null return | ✅ |
| T4 | Add tests for `learning-catalog.ts` — all 4 exports with edge cases | ✅ |
| T5 | Remove dead code `lesson-workspace.tsx` — no imports remain | ✅ |
| T6 | Evaluate `training-platform.tsx` scope — document which features still rely on SPA shell | ✅ |

### T6 Evaluation: training-platform.tsx Decomposition Plan

**Current state:** 1 428 lines, zero page-level imports (root `page.tsx` redirects to `/dashboard`). Referenced only in `lab-integration.test.ts` comments and `docs/repository-map.md`.

#### Features already migrated to academy shell

| Feature | Academy location |
| --- | --- |
| Lesson display + 4-step flow | `lesson-flow.tsx` via `(academy)/lessons/[lessonId]` |
| Guided notes (new, not in SPA) | `guided-notes.tsx` inside LessonFlow |
| Prerequisite review (new) | `lesson-review-panel.tsx` inside LessonFlow |
| Course / module / lesson browsing | `(academy)/courses`, `/modules`, `/lessons` pages |
| Dashboard overview | `learner-dashboard.tsx` via `(academy)/dashboard` |
| Competency tracker | `competency-tracker.tsx` via `(academy)/progress` |
| Exercises, validation, hints | `useExerciseValidation` in LessonFlow |
| Lab lifecycle | `useLabLifecycle` in LessonFlow |
| Terminal | `LessonTerminal` in LessonFlow |
| Code exercises | `LessonCodeExercises` in LessonFlow |
| Artifact management + export | `useArtifactManager` in LessonFlow |
| Breadcrumbs | `academy-breadcrumbs.tsx` |
| Prev / next lesson nav | Prev/next links in lesson page |

#### Features still exclusive to SPA shell (must migrate before retirement)

| Feature | Approx lines | Migration target |
| --- | --- | --- |
| **Storage health UX** — banner, recovery dialog, recovery log, surface chips, dirty indicators, severity tiers, key guidance | ~250 | Academy layout provider / context |
| **SaveToast** — error/success flash for writes | ~30 | Academy layout |
| **PlatformNavbar** — progress bar, breadcrumbs, search trigger, notifications, theme toggle | ~40 (render) | Academy shell header |
| **GlobalSearch** — arrow-key nav, lesson search | component | Academy shell |
| **Keyboard shortcuts** — j/k nav, h home, m complete, n notes, e exercises, / search, ? help, Esc | hook | Academy shell |
| **KeyboardShortcutsDialog** | component | Academy shell |
| **Theme toggle** — `useTheme` dark mode | hook | Academy layout |
| **Notification system** — review-due, milestone, streak notifications | ~40 | Academy shell header |
| **Achievement panel** — phase badges, streak | component | `/dashboard` or `/progress` |
| **Home marketing views** — HeroSection, ProgressRoadmap, HomeDashboard, PricingCallout, SocialProof, FaqSection, FeatureHighlights, PageFooter | components | `/` or `/dashboard` |
| **Onboarding card** — first-visit guidance | component | Academy dashboard |
| **Lesson entry cue** — orientation messages | component + timer | Already extracted; wire into academy nav |
| **Completion gating** — `evaluateLessonEvidenceGate` before marking done | ~30 | LessonFlow |
| **Review marking** — `markReviewed`, spaced repetition queue | ~20 | LessonFlow or `/progress` |
| **Reset lab / reset all progress** | ~40 | LessonFlow / settings page |
| **Analytics dashboards** — `useAnalyticsDashboards` feeding SidebarPanels | hook + panel | `/progress` page |

#### Recommended decomposition order

1. **Storage health provider** — extract storage event listeners, health mode, surface failures, recovery log into a React context. Mount in `(academy)/layout.tsx`. This unblocks removing the largest state block from the SPA shell.
2. **Global UX migration** — add PlatformNavbar (or equivalent), GlobalSearch, KeyboardShortcuts, Theme toggle to `academy-shell.tsx`. This gives the academy full navigational parity.
3. **Completion gating + review** — integrate `evaluateLessonEvidenceGate` and review marking into `lesson-flow.tsx` step 4.
4. **Home / marketing page** — create an academy-native landing with hero, roadmap, dashboard, achievements either at `/` or `/dashboard`.
5. **Analytics dashboards** — wire `useAnalyticsDashboards` into `(academy)/progress/page.tsx`.
6. **Retire `training-platform.tsx`** — once all features have academy equivalents, delete the file and update `docs/repository-map.md` and `lab-integration.test.ts` comments.

> **Key constraint:** Do not delete `training-platform.tsx` until every feature above has a working academy equivalent with tests. The file is safe to leave in-tree as dead code during the migration since it has no runtime import path.

### Short-Term

| ID | Task | Status |
| --- | --- | --- |
| T7 | Content quality pass — Phase 1 lessons (explanation, demo, retention depth) | ⬚ |
| T8 | Content quality pass — Phase 2–4 lessons | ⬚ |
| T9 | CSS modularization — extract component class-system namespaces from globals.css | ⬚ |
| T10 | Independent readiness UI route — `/readiness` page with assessment wizard | ⬚ |
| T11 | Export/backup dialog for localStorage — JSON download/import for data portability | ⬚ |

### Medium-Term

| ID | Task | Status |
| --- | --- | --- |
| T12 | AI review loop — bounded LLM integration scoped to reflection step | ⬚ |
| T13 | Durable persistence layer — IndexedDB or server-backed with migration from localStorage | ⬚ |
| T14 | Advanced lab templates — realistic bug-set labs and project scaffolds | ⬚ |
| T15 | Real workspace runtime — sandboxed runtime with real file I/O | ⬚ |

---

## Final Recommendation

> Treat ComputeLearn as a training platform for engineering execution. The structural foundation is strong — academy shell, lesson flow, 15 engines, 471 tests. The next value multiplier is content quality, followed by persistence durability and the AI review loop.

---

*Prepared as a working product specification for shaping scope, implementation order, and future investor or collaborator discussions.*
