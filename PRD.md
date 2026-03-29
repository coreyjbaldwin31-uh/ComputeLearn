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
| **Current baseline** | Next.js App Router, React 19, TypeScript, component-based UI, local persistence, curriculum shell, and lightweight validation. |

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
| **Must** | Phase 1 excellence | Filesystem, terminal, search/filtering, automation basics, and workflow efficiency | 🔧 Curriculum authored, lab templates pending |
| **Should** | Guided debugging | Error-focused labs, inspect mode, diff view, and layered hints | ✅ Done |
| **Should** | Retention system | Reflection prompts and spaced repetition tied to weak competencies | ✅ Done |
| **Later** | AI review loop | Bounded support for explanation, critique, and next-step guidance | ⬚ Not started |
| **Later** | Advanced templates | More realistic bug sets, project scaffolds, and saved transcripts |

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

> A new learner can enter the platform with limited terminal confidence, complete a structured Phase 1 path, pass validation-driven labs, succeed on at least one reduced-guidance transfer task, and leave with demonstrably stronger operational fluency.

---

## 8. Technical Architecture Direction

The stated stack is appropriate for the current product direction: Next.js App Router, React 19, TypeScript, component-based UI, and local persistence. The next architectural step is to formalize the domain model around curriculum, competencies, labs, attempts, and artifacts.

### Recommended Application Layers

| Layer | Responsibility |
| --- | --- |
| **Application layer** | Routing, orchestration, learner state, navigation flow, and gating decisions |
| **Curriculum layer** | Phases, courses, lessons, competencies, milestones, and assessment rules |
| **Lab engine layer** | Workspace templates, resets, replays, validation, hints, artifacts, and attempt tracking |
| **Persistence layer** | Local storage or indexed persistence for progress, notes, attempts, competencies, and artifacts |
| **Review layer** | Feedback presentation, reflections, and optional AI-assisted critique |

### Minimum Data Model

At minimum, the platform should represent **Learner**, **Phase**, **Course**, **Lesson**, **Lab**, **Attempt**, **CompetencyRecord**, and **Artifact** as first-class entities. That creates the backbone for gating, reflection, saved work, and later analytics.

### Validation Engine Contract

The validator should be able to check file presence, directory structure, file content, command output, code behavior, and test pass conditions. Each result should return:

- pass or fail
- failed criteria
- probable skill gap
- optional hint guidance

**Implementation status:** All six validation rule kinds are implemented in `lib/lab-engine.ts` — `file-presence`, `directory-structure`, `content-match`, `command-output`, `code-behavior`, and `test-pass`. Each returns pass/fail, a human-readable message, and a probable skill gap string. Hint access is provided via `getLabHint()` with layered escalation.

---

## 9. Roadmap, Metrics, and Risks

### Roadmap Recommendation

> Status markers: ✅ done · 🔧 in progress · ⬚ not started

1. ✅ Define the competency graph for Phase 1 — 15 domains mapped across 37 lessons with mastery levels
2. ✅ Define the workspace and lab template model — lab-engine with template, instance, reset/replay, hints, artifact capture
3. ✅ Ship the validation engine contract — file-presence, directory-structure, content-match, command-output, code-behavior, test-pass rules
4. ⬚ Create the first 10 high-value Phase 1 labs — curriculum has exercises but no authored lab templates yet
5. ✅ Add milestone gating, reflections, and artifact saving — milestone-engine, reflection-engine, artifact-engine, export, and browser
6. ✅ Introduce guided debugging labs and inspect mode — inspection-engine, layered hints, diff-style output
7. 🔧 Expand into Phase 2 once Phase 1 outcomes are visibly strong — Phase 2–4 curriculum authored; lab runtime integration pending

### Primary Product Metrics

| Metric | Why It Matters |
| --- | --- |
| **Transfer-task pass rate** | Best single indicator of genuine learning instead of walkthrough completion |
| **Independent lab completion rate** | Measures whether support can be reduced without collapse |
| **Repeated error reduction** | Shows whether the platform actually repairs foundational weaknesses |
| **Milestone pass rate** | Tracks progression quality through gated curriculum |
| **Artifact completion rate** | Indicates whether learners leave with saved evidence of work |

### Key Risks and Mitigation

| Risk | Mitigation |
| --- | --- |
| Too much explanation, not enough execution | Keep concept blocks short and lab-first |
| Labs feel toy-like or artificial | Model realistic tasks and authentic failure modes |
| Progress becomes completion-based | Require transfer evidence and competency gates |
| AI makes learners dependent | Constrain AI to guidance, critique, and reflection support |
| Scope expands too early | Make Phase 1 and the lab engine excellent before broad expansion |

---

## Final Recommendation

> Treat ComputeLearn as a training platform for engineering execution. Build the competency graph, the lab engine, and the first ten excellent labs before expanding into heavier AI, analytics, or broad curriculum surface area.

---

*Prepared as a working product specification for shaping scope, implementation order, and future investor or collaborator discussions.*
