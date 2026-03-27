import { describe, expect, it } from "vitest";
import { flattenLessonEntries } from "./progression-engine";
import { getReinforcementQueue, getWeakTrackHits } from "./reinforcement-engine";

describe("getWeakTrackHits", () => {
  it("returns overlapping competency tracks", () => {
    const lesson = {
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
      competencies: [
        { track: "Debugging", targetLevel: "Functional" },
        { track: "ApiInteraction", targetLevel: "Aware" },
      ],
    };

    expect(getWeakTrackHits(lesson, ["Debugging", "VersionControl"])).toEqual([
      "Debugging",
    ]);
  });

  it("returns empty array when lesson has no competencies", () => {
    const lesson = {
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
    };

    expect(getWeakTrackHits(lesson, ["Debugging"])).toEqual([]);
  });
});

describe("getReinforcementQueue", () => {
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
                title: "Debugging Basics",
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
                competencies: [{ track: "Debugging", targetLevel: "Functional" }],
              },
              {
                id: "l2",
                title: "API Practice",
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
                competencies: [{ track: "ApiInteraction", targetLevel: "Functional" }],
              },
              {
                id: "l3",
                title: "Git Safety",
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
                competencies: [{ track: "VersionControl", targetLevel: "Functional" }],
              },
            ],
          },
        ],
      },
    ],
  };

  const entries = flattenLessonEntries(curriculum);

  it("returns empty when no weak tracks are provided", () => {
    const queue = getReinforcementQueue(
      entries,
      {},
      [],
      Date.parse("2026-04-10T00:00:00.000Z"),
    );

    expect(queue).toEqual([]);
  });

  it("includes only due lessons that overlap weak tracks", () => {
    const queue = getReinforcementQueue(
      entries,
      {
        l1: {
          completedAt: "2026-04-01T00:00:00.000Z",
          lastReviewedAt: null,
          reviewCount: 0,
        },
        l2: {
          completedAt: "2026-04-10T00:00:00.000Z",
          lastReviewedAt: null,
          reviewCount: 0,
        },
      },
      ["Debugging", "VersionControl"],
      Date.parse("2026-04-10T12:00:00.000Z"),
    );

    expect(queue.map((item) => item.entry.lesson.id)).toEqual(["l1"]);
  });

  it("prioritizes lessons with more overdue weight", () => {
    const queue = getReinforcementQueue(
      entries,
      {
        l1: {
          completedAt: "2026-04-01T00:00:00.000Z",
          lastReviewedAt: null,
          reviewCount: 0,
        },
        l3: {
          completedAt: "2026-04-03T00:00:00.000Z",
          lastReviewedAt: null,
          reviewCount: 0,
        },
      },
      ["Debugging", "VersionControl"],
      Date.parse("2026-04-15T00:00:00.000Z"),
    );

    expect(queue[0]?.entry.lesson.id).toBe("l1");
  });

  it("respects the result limit", () => {
    const queue = getReinforcementQueue(
      entries,
      {
        l1: {
          completedAt: "2026-04-01T00:00:00.000Z",
          lastReviewedAt: null,
          reviewCount: 0,
        },
        l2: {
          completedAt: "2026-04-01T00:00:00.000Z",
          lastReviewedAt: null,
          reviewCount: 0,
        },
        l3: {
          completedAt: "2026-04-01T00:00:00.000Z",
          lastReviewedAt: null,
          reviewCount: 0,
        },
      },
      ["Debugging", "ApiInteraction", "VersionControl"],
      Date.parse("2026-04-10T00:00:00.000Z"),
      2,
    );

    expect(queue).toHaveLength(2);
  });
});
