import type { Curriculum } from "@/data/curriculum";
import { describe, expect, it } from "vitest";
import {
    calculateActivityStreak,
    calculateCompetencyLevels,
    calculatePercentComplete,
    evaluatePhaseExitStatus,
    flattenLessonEntries,
    formatTrackName,
    getDueReviewQueue,
    getLessonNeighbors,
    getLevelThreshold,
    getMasteryLevel,
    getNextReviewDays,
    getPhaseProgressSnapshot,
    isDueForReview,
} from "./progression-engine";

describe("progression-engine", () => {
  it("uses spaced repetition schedule", () => {
    expect(getNextReviewDays(0)).toBe(1);
    expect(getNextReviewDays(1)).toBe(3);
    expect(getNextReviewDays(2)).toBe(7);
    expect(getNextReviewDays(3)).toBe(14);
    expect(getNextReviewDays(4)).toBe(30);
  });

  it("detects due reviews", () => {
    const record = {
      completedAt: "2026-03-20T00:00:00.000Z",
      lastReviewedAt: null,
      reviewCount: 1,
    };

    expect(isDueForReview(record, Date.parse("2026-03-22T23:00:00.000Z"))).toBe(
      false,
    );
    expect(isDueForReview(record, Date.parse("2026-03-23T00:00:01.000Z"))).toBe(
      true,
    );
  });

  it("maps mastery and gate levels correctly", () => {
    expect(getMasteryLevel(0)).toBe("unstarted");
    expect(getMasteryLevel(2)).toBe("aware");
    expect(getMasteryLevel(6)).toBe("assisted");
    expect(getMasteryLevel(10)).toBe("functional");
    expect(getMasteryLevel(15)).toBe("independent");

    expect(getLevelThreshold("aware")).toBe(2);
    expect(getLevelThreshold("functional")).toBe(8);
    expect(getLevelThreshold("independent")).toBe(12);
  });

  it("formats competency track names", () => {
    expect(formatTrackName("ApiInteraction")).toBe("Api Interaction");
  });

  it("calculates activity streak from review history", () => {
    const reviews = {
      l1: {
        completedAt: "2026-03-24T10:00:00.000Z",
        lastReviewedAt: "2026-03-25T10:00:00.000Z",
        reviewCount: 1,
      },
      l2: {
        completedAt: "2026-03-26T10:00:00.000Z",
        lastReviewedAt: null,
        reviewCount: 0,
      },
    };

    const streak = calculateActivityStreak(reviews, new Date("2026-03-26T12:00:00.000Z"));
    expect(streak).toBe(3);
  });

  it("calculates competency levels from completed lessons", () => {
    const curriculum = {
      productTitle: "ComputeLearn",
      productVision: "vision",
      promise: "promise",
      phases: [
        {
          id: "phase-1",
          title: "Phase",
          strapline: "strap",
          purpose: "purpose",
          level: "Beginner",
          duration: "4 weeks",
          environment: "env",
          tools: [],
          guardrails: [],
          milestones: [],
          projects: [],
          courses: [
            {
              id: "c1",
              title: "Course",
              focus: "focus",
              outcome: "outcome",
              lessons: [
                {
                  id: "l1",
                  title: "Lesson 1",
                  summary: "",
                  duration: "",
                  difficulty: "",
                  objective: "",
                  explanation: [],
                  demonstration: [],
                  exerciseSteps: [],
                  validationChecks: [],
                  retention: [],
                  tools: [],
                  notesPrompt: "",
                  exercises: [
                    {
                      id: "e1",
                      title: "e1",
                      prompt: "",
                      placeholder: "",
                      validationMode: "includes" as const,
                      acceptedAnswers: ["x"],
                      successMessage: "",
                      hint: "",
                    },
                    {
                      id: "e2",
                      title: "e2",
                      prompt: "",
                      placeholder: "",
                      validationMode: "includes" as const,
                      acceptedAnswers: ["x"],
                      successMessage: "",
                      hint: "",
                    },
                  ],
                  competencies: [{ track: "Debugging", targetLevel: "Functional" }],
                },
              ],
            },
          ],
        },
      ],
    } satisfies Curriculum;

    const result = calculateCompetencyLevels(curriculum, { l1: true });
    expect(result.Debugging).toBe(2);
  });

  it("evaluates phase exit gates and advancement readiness", () => {
    const curriculum = {
      productTitle: "ComputeLearn",
      productVision: "vision",
      promise: "promise",
      phases: [
        {
          id: "phase-1",
          title: "Phase 1",
          strapline: "strap",
          purpose: "purpose",
          level: "Beginner",
          duration: "4 weeks",
          environment: "env",
          tools: [],
          guardrails: [],
          milestones: [],
          projects: [],
          competencyFocus: ["SystemNavigation"],
          exitStandard: {
            summary: "Summary",
            representativeLabs: [],
            gates: [
              {
                description: "Functional navigation",
                competency: "SystemNavigation",
                requiredLevel: "Functional",
              },
            ],
          },
          courses: [],
        },
        {
          id: "phase-2",
          title: "Phase 2",
          strapline: "strap",
          purpose: "purpose",
          level: "Intermediate",
          duration: "4 weeks",
          environment: "env",
          tools: [],
          guardrails: [],
          milestones: [],
          projects: [],
          courses: [],
        },
      ],
    } satisfies Curriculum;

    const evaluated = evaluatePhaseExitStatus(
      curriculum,
      "phase-1",
      { SystemNavigation: 8 },
      1,
      2,
    );

    expect(evaluated).not.toBeNull();
    expect(evaluated?.gates[0]?.passed).toBe(true);
    expect(evaluated?.competencyGatesPassed).toBe(true);
    expect(evaluated?.transferGatePassed).toBe(true);
    expect(evaluated?.allPassed).toBe(true);
    expect(evaluated?.nextPhase?.id).toBe("phase-2");
  });

  it("returns null when phase has no exit standard", () => {
    const curriculum = {
      productTitle: "ComputeLearn",
      productVision: "vision",
      promise: "promise",
      phases: [
        {
          id: "phase-1",
          title: "Phase 1",
          strapline: "strap",
          purpose: "purpose",
          level: "Beginner",
          duration: "4 weeks",
          environment: "env",
          tools: [],
          guardrails: [],
          milestones: [],
          projects: [],
          courses: [],
        },
      ],
    };

    const evaluated = evaluatePhaseExitStatus(curriculum, "phase-1", {}, 0, 0);
    expect(evaluated).toBeNull();
  });

  it("flattens lessons and computes neighbors", () => {
    const curriculum = {
      productTitle: "ComputeLearn",
      productVision: "vision",
      promise: "promise",
      phases: [
        {
          id: "phase-1",
          title: "Phase 1",
          strapline: "strap",
          purpose: "purpose",
          level: "Beginner",
          duration: "4 weeks",
          environment: "env",
          tools: [],
          guardrails: [],
          milestones: [],
          projects: [],
          courses: [
            {
              id: "c1",
              title: "Course 1",
              focus: "focus",
              outcome: "outcome",
              lessons: [
                {
                  id: "l1",
                  title: "Lesson 1",
                  summary: "",
                  duration: "",
                  difficulty: "",
                  objective: "",
                  explanation: [],
                  demonstration: [],
                  exerciseSteps: [],
                  validationChecks: [],
                  retention: [],
                  tools: [],
                  notesPrompt: "",
                  exercises: [],
                },
                {
                  id: "l2",
                  title: "Lesson 2",
                  summary: "",
                  duration: "",
                  difficulty: "",
                  objective: "",
                  explanation: [],
                  demonstration: [],
                  exerciseSteps: [],
                  validationChecks: [],
                  retention: [],
                  tools: [],
                  notesPrompt: "",
                  exercises: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const entries = flattenLessonEntries(curriculum);
    expect(entries).toHaveLength(2);

    const neighbors = getLessonNeighbors(entries, "l1");
    expect(neighbors.previous).toBeNull();
    expect(neighbors.next?.lesson.id).toBe("l2");
  });

  it("builds due review queue from lesson entries", () => {
    const curriculum = {
      productTitle: "ComputeLearn",
      productVision: "vision",
      promise: "promise",
      phases: [
        {
          id: "phase-1",
          title: "Phase 1",
          strapline: "strap",
          purpose: "purpose",
          level: "Beginner",
          duration: "4 weeks",
          environment: "env",
          tools: [],
          guardrails: [],
          milestones: [],
          projects: [],
          courses: [
            {
              id: "c1",
              title: "Course 1",
              focus: "focus",
              outcome: "outcome",
              lessons: [
                {
                  id: "l1",
                  title: "Lesson 1",
                  summary: "",
                  duration: "",
                  difficulty: "",
                  objective: "",
                  explanation: [],
                  demonstration: [],
                  exerciseSteps: [],
                  validationChecks: [],
                  retention: [],
                  tools: [],
                  notesPrompt: "",
                  exercises: [],
                },
                {
                  id: "l2",
                  title: "Lesson 2",
                  summary: "",
                  duration: "",
                  difficulty: "",
                  objective: "",
                  explanation: [],
                  demonstration: [],
                  exerciseSteps: [],
                  validationChecks: [],
                  retention: [],
                  tools: [],
                  notesPrompt: "",
                  exercises: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const entries = flattenLessonEntries(curriculum);
    const queue = getDueReviewQueue(
      entries,
      {
        l1: {
          completedAt: "2026-03-20T00:00:00.000Z",
          lastReviewedAt: null,
          reviewCount: 1,
        },
        l2: {
          completedAt: "2026-03-25T00:00:00.000Z",
          lastReviewedAt: null,
          reviewCount: 0,
        },
      },
      Date.parse("2026-03-23T00:00:01.000Z"),
    );

    expect(queue.map((entry) => entry.lesson.id)).toEqual(["l1"]);
  });

  it("calculates percent complete from progress", () => {
    const curriculum = {
      productTitle: "ComputeLearn",
      productVision: "vision",
      promise: "promise",
      phases: [
        {
          id: "phase-1",
          title: "Phase 1",
          strapline: "strap",
          purpose: "purpose",
          level: "Beginner",
          duration: "4 weeks",
          environment: "env",
          tools: [],
          guardrails: [],
          milestones: [],
          projects: [],
          courses: [
            {
              id: "c1",
              title: "Course 1",
              focus: "focus",
              outcome: "outcome",
              lessons: [
                {
                  id: "l1",
                  title: "Lesson 1",
                  summary: "",
                  duration: "",
                  difficulty: "",
                  objective: "",
                  explanation: [],
                  demonstration: [],
                  exerciseSteps: [],
                  validationChecks: [],
                  retention: [],
                  tools: [],
                  notesPrompt: "",
                  exercises: [],
                },
                {
                  id: "l2",
                  title: "Lesson 2",
                  summary: "",
                  duration: "",
                  difficulty: "",
                  objective: "",
                  explanation: [],
                  demonstration: [],
                  exerciseSteps: [],
                  validationChecks: [],
                  retention: [],
                  tools: [],
                  notesPrompt: "",
                  exercises: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const percent = calculatePercentComplete(curriculum, { l1: true });
    expect(percent).toBe(50);
  });

  it("summarises phase progress and transfer counts", () => {
    const phase = {
      id: "phase-1",
      title: "Phase 1",
      strapline: "strap",
      purpose: "purpose",
      level: "Beginner",
      duration: "4 weeks",
      environment: "env",
      tools: [],
      guardrails: [],
      milestones: [],
      projects: [],
      courses: [
        {
          id: "c1",
          title: "Course 1",
          focus: "focus",
          outcome: "outcome",
          lessons: [
            {
              id: "l1",
              title: "Lesson 1",
              summary: "",
              duration: "",
              difficulty: "",
              objective: "",
              explanation: [],
              demonstration: [],
              exerciseSteps: [],
              validationChecks: [],
              retention: [],
              tools: [],
              notesPrompt: "",
              exercises: [],
              transferTask: {
                id: "tt1",
                title: "Transfer",
                prompt: "",
                placeholder: "",
                validationMode: "includes" as const,
                acceptedAnswers: ["x"],
                successMessage: "",
                hint: "",
              },
            },
            {
              id: "l2",
              title: "Lesson 2",
              summary: "",
              duration: "",
              difficulty: "",
              objective: "",
              explanation: [],
              demonstration: [],
              exerciseSteps: [],
              validationChecks: [],
              retention: [],
              tools: [],
              notesPrompt: "",
              exercises: [],
            },
          ],
        },
      ],
    };

    const snapshot = getPhaseProgressSnapshot(
      phase,
      { l1: true },
      { l1: true },
    );

    expect(snapshot.totalLessons).toBe(2);
    expect(snapshot.completedLessons).toBe(1);
    expect(snapshot.transferLessons).toBe(1);
    expect(snapshot.transferEvidence).toBe(1);
  });
});

describe("progression-engine edge cases", () => {
  it("calculateActivityStreak returns 0 with no reviews", () => {
    expect(calculateActivityStreak({})).toBe(0);
  });

  it("calculateActivityStreak counts reviews on a single day as 1", () => {
    const reviews = {
      l1: {
        completedAt: "2026-04-10T08:00:00.000Z",
        lastReviewedAt: "2026-04-10T09:00:00.000Z",
        reviewCount: 1,
      },
      l2: {
        completedAt: "2026-04-10T10:00:00.000Z",
        lastReviewedAt: null,
        reviewCount: 0,
      },
    };
    const streak = calculateActivityStreak(
      reviews,
      new Date("2026-04-10T20:00:00.000Z"),
    );
    expect(streak).toBe(1);
  });

  it("getDueReviewQueue returns empty array when no reviews exist", () => {
    const entries = [
      {
        phase: { id: "p1", title: "P1", strapline: "", purpose: "", level: "", duration: "", environment: "", tools: [], guardrails: [], milestones: [], projects: [], courses: [] },
        course: { id: "c1", title: "C1", focus: "", outcome: "", lessons: [] },
        lesson: { id: "l1", title: "L1", summary: "", duration: "", difficulty: "", objective: "", explanation: [], demonstration: [], exerciseSteps: [], validationChecks: [], retention: [], tools: [], notesPrompt: "", exercises: [] },
      },
    ];
    const queue = getDueReviewQueue(entries, {});
    expect(queue).toHaveLength(0);
  });

  it("getDueReviewQueue excludes lessons reviewed recently", () => {
    const entries = [
      {
        phase: { id: "p1", title: "P1", strapline: "", purpose: "", level: "", duration: "", environment: "", tools: [], guardrails: [], milestones: [], projects: [], courses: [] },
        course: { id: "c1", title: "C1", focus: "", outcome: "", lessons: [] },
        lesson: { id: "l1", title: "L1", summary: "", duration: "", difficulty: "", objective: "", explanation: [], demonstration: [], exerciseSteps: [], validationChecks: [], retention: [], tools: [], notesPrompt: "", exercises: [] },
      },
    ];
    const queue = getDueReviewQueue(
      entries,
      {
        l1: {
          completedAt: "2026-04-01T00:00:00.000Z",
          lastReviewedAt: null,
          reviewCount: 0,
        },
      },
      Date.parse("2026-04-01T12:00:00.000Z"),
    );
    expect(queue).toHaveLength(0);
  });

  it("getMasteryLevel returns 'aware' at exact lower boundary (2)", () => {
    expect(getMasteryLevel(2)).toBe("aware");
  });

  it("getMasteryLevel returns 'independent' for very high count", () => {
    expect(getMasteryLevel(100)).toBe("independent");
  });

  it("isDueForReview uses lastReviewedAt when present", () => {
    const record = {
      completedAt: "2026-01-01T00:00:00.000Z",
      lastReviewedAt: "2026-04-10T00:00:00.000Z",
      reviewCount: 3,
    };
    // 3 reviews => next due in 14 days => due at 2026-04-24
    expect(
      isDueForReview(record, Date.parse("2026-04-23T23:59:59.000Z")),
    ).toBe(false);
    expect(
      isDueForReview(record, Date.parse("2026-04-24T00:00:01.000Z")),
    ).toBe(true);
  });

  it("calculatePercentComplete returns 0 with no completed lessons", () => {
    const curriculum = {
      productTitle: "T",
      productVision: "v",
      promise: "p",
      phases: [
        {
          id: "p1",
          title: "P1",
          strapline: "",
          purpose: "",
          level: "",
          duration: "",
          environment: "",
          tools: [],
          guardrails: [],
          milestones: [],
          projects: [],
          courses: [
            {
              id: "c1",
              title: "C1",
              focus: "",
              outcome: "",
              lessons: [
                { id: "l1", title: "", summary: "", duration: "", difficulty: "", objective: "", explanation: [], demonstration: [], exerciseSteps: [], validationChecks: [], retention: [], tools: [], notesPrompt: "", exercises: [] },
              ],
            },
          ],
        },
      ],
    };
    expect(calculatePercentComplete(curriculum, {})).toBe(0);
  });
});
