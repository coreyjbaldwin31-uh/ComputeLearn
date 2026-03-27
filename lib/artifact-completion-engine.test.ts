import { describe, expect, it } from "vitest";
import type { Curriculum } from "../data/curriculum";
import { buildArtifactCompletionSummary } from "./artifact-completion-engine";

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
              id: "lesson-1",
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
              id: "lesson-2",
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

describe("buildArtifactCompletionSummary", () => {
  it("tracks evidence coverage for completed lessons", () => {
    const summary = buildArtifactCompletionSummary(
      curriculum,
      { "lesson-1": true, "lesson-2": true },
      [
        {
          id: "a1",
          lessonId: "lesson-1",
          type: "note",
          title: "Note",
          content: "content",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
        {
          id: "a2",
          lessonId: "lesson-2",
          type: "completion",
          title: "Completion",
          content: "content",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    );

    expect(summary.completedLessons).toBe(2);
    expect(summary.lessonsWithEvidence).toBe(1);
    expect(summary.lessonsMissingEvidence).toBe(1);
    expect(summary.completionRate).toBe(50);
    expect(summary.evidenceCoverageByPhase[0].completionRate).toBe(50);
  });

  it("returns zero rates when no completed lessons exist", () => {
    const summary = buildArtifactCompletionSummary(curriculum, {}, []);

    expect(summary.completedLessons).toBe(0);
    expect(summary.lessonsWithEvidence).toBe(0);
    expect(summary.lessonsMissingEvidence).toBe(0);
    expect(summary.completionRate).toBe(0);
  });
});