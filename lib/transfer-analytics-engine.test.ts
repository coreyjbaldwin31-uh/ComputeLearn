import { describe, expect, it } from "vitest";
import type { Curriculum } from "@/data/curriculum";
import { buildPhaseTransferAnalytics } from "./transfer-analytics-engine";

describe("buildPhaseTransferAnalytics", () => {
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
        courses: [
          {
            id: "c1",
            title: "Course",
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
                exercises: [],
                transferTask: {
                  id: "t1",
                  title: "Transfer",
                  prompt: "",
                  placeholder: "",
                  validationMode: "includes",
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
      },
    ],
  };

  it("counts transfer tasks and pass rates by phase", () => {
    const analytics = buildPhaseTransferAnalytics(curriculum, { l1: true });
    expect(analytics[0].totalTransferLessons).toBe(1);
    expect(analytics[0].passedTransferLessons).toBe(1);
    expect(analytics[0].passRate).toBe(100);
  });

  it("returns zero pass rate when a phase has no transfer tasks", () => {
    const analytics = buildPhaseTransferAnalytics(
      {
        ...curriculum,
        phases: [{ ...curriculum.phases[0], courses: [{ ...curriculum.phases[0].courses[0], lessons: [curriculum.phases[0].courses[0].lessons[1]] }] }],
      } satisfies Curriculum,
      {},
    );
    expect(analytics[0].totalTransferLessons).toBe(0);
    expect(analytics[0].passRate).toBe(0);
  });
});