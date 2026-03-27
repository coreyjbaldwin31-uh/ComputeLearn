import type { Curriculum } from "@/data/curriculum";
import { describe, expect, it } from "vitest";
import { buildPhaseStatusRecords } from "./phase-status-engine";

describe("buildPhaseStatusRecords", () => {
  const curriculum: Curriculum = {
    productTitle: "ComputeLearn",
    productVision: "vision",
    promise: "promise",
    phases: [
      {
        id: "phase-1",
        title: "Phase 1",
        strapline: "",
        purpose: "",
        level: "",
        duration: "",
        environment: "",
        tools: [],
        guardrails: [],
        milestones: [],
        projects: [],
        competencyFocus: ["Debugging"],
        exitStandard: {
          summary: "",
          representativeLabs: [],
          gates: [
            {
              description: "Debugging functional",
              competency: "Debugging",
              requiredLevel: "Functional",
            },
          ],
        },
        courses: [
          {
            id: "c1",
            title: "Course 1",
            focus: "",
            outcome: "",
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
                    title: "Exercise",
                    prompt: "",
                    placeholder: "",
                    validationMode: "includes",
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
      {
        id: "phase-2",
        title: "Phase 2",
        strapline: "",
        purpose: "",
        level: "",
        duration: "",
        environment: "",
        tools: [],
        guardrails: [],
        milestones: [],
        projects: [],
        courses: [],
      },
    ],
  };

  it("marks an untouched phase as not-started", () => {
    const statuses = buildPhaseStatusRecords(curriculum, {}, {}, {}, {});
    expect(statuses[0].statusLabel).toBe("not-started");
  });

  it("marks a fully complete gated phase as ready when milestone conditions pass", () => {
    const statuses = buildPhaseStatusRecords(
      curriculum,
      { l1: true },
      {},
      { Debugging: 8 },
      {
        l1: {
          completedAt: new Date().toISOString(),
          lastReviewedAt: new Date().toISOString(),
          reviewCount: 5,
        },
      },
      Date.parse("2026-04-10T12:00:00.000Z"),
    );

    expect(statuses[0].statusLabel).toBe("ready");
    expect(statuses[0].readyToAdvance).toBe(true);
  });

  it("marks a fully complete phase as review-needed when reinforcement remains due", () => {
    const statuses = buildPhaseStatusRecords(
      curriculum,
      { l1: true },
      {},
      { Debugging: 0 },
      {
        l1: {
          completedAt: "2026-04-01T00:00:00.000Z",
          lastReviewedAt: null,
          reviewCount: 0,
        },
      },
      Date.parse("2026-04-10T12:00:00.000Z"),
    );

    expect(statuses[0].statusLabel).toBe("review-needed");
    expect(statuses[0].reinforcementPendingCount).toBe(1);
  });
});
