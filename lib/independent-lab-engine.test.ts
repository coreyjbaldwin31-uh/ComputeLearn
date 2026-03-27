import { describe, expect, it } from "vitest";
import type { Curriculum } from "../data/curriculum";
import { buildIndependentLabSummary } from "./independent-lab-engine";

const curriculum: Curriculum = {
  productTitle: "Test",
  productVision: "Test",
  promise: "Test",
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
          id: "course-1",
          title: "Course",
          focus: "",
          outcome: "",
          lessons: [
            {
              id: "lesson-ticket",
              title: "Ticket lab",
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
                  id: "exercise-1",
                  title: "Exercise",
                  prompt: "",
                  placeholder: "",
                  validationMode: "includes",
                  acceptedAnswers: ["x"],
                  successMessage: "",
                  hint: "",
                },
              ],
              transferTask: {
                id: "transfer-1",
                title: "Transfer",
                prompt: "",
                placeholder: "",
                validationMode: "includes",
                acceptedAnswers: ["y"],
                successMessage: "",
                hint: "",
              },
              scaffoldingLevel: "ticket-style",
            },
          ],
        },
      ],
    },
  ],
};

describe("buildIndependentLabSummary", () => {
  it("tracks completion, validated, and first-pass ticket labs", () => {
    const summary = buildIndependentLabSummary(
      curriculum,
      { "lesson-ticket": true },
      { "lesson-ticket": true },
      [
        {
          id: "a1",
          lessonId: "lesson-ticket",
          exerciseId: "exercise-1",
          assessmentType: "action",
          answer: "attempt",
          passed: false,
          attemptedAt: "2025-01-01T00:00:00.000Z",
        },
        {
          id: "a2",
          lessonId: "lesson-ticket",
          exerciseId: "exercise-1",
          assessmentType: "action",
          answer: "attempt 2",
          passed: true,
          attemptedAt: "2025-01-01T00:01:00.000Z",
        },
        {
          id: "a3",
          lessonId: "lesson-ticket",
          exerciseId: "transfer-1",
          assessmentType: "transfer",
          answer: "transfer",
          passed: true,
          attemptedAt: "2025-01-01T00:02:00.000Z",
        },
      ],
    );

    expect(summary.totalLabs).toBe(1);
    expect(summary.completedLabs).toBe(1);
    expect(summary.validatedLabs).toBe(1);
    expect(summary.firstPassLabs).toBe(0);
    expect(summary.completionRate).toBe(100);
  });

  it("keeps completion at zero when transfer evidence is missing", () => {
    const summary = buildIndependentLabSummary(
      curriculum,
      { "lesson-ticket": true },
      {},
      [],
    );

    expect(summary.completedLabs).toBe(0);
    expect(summary.validatedLabs).toBe(0);
    expect(summary.firstPassLabs).toBe(0);
    expect(summary.completionRate).toBe(0);
  });
});
