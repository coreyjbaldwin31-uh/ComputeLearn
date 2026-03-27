import { describe, expect, it } from "vitest";
import { buildAttemptAnalyticsSummary } from "./attempt-analytics-engine";

describe("buildAttemptAnalyticsSummary", () => {
  const attempts = [
    {
      id: "a1",
      lessonId: "lesson-1",
      exerciseId: "ex-1",
      assessmentType: "debugging",
      answer: "first",
      passed: false,
      attemptedAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "a2",
      lessonId: "lesson-1",
      exerciseId: "ex-1",
      assessmentType: "debugging",
      answer: "second",
      passed: true,
      attemptedAt: "2025-01-01T01:00:00.000Z",
    },
    {
      id: "a3",
      lessonId: "lesson-1",
      exerciseId: "ex-2",
      assessmentType: "reasoning",
      answer: "only",
      passed: true,
      attemptedAt: "2025-01-01T02:00:00.000Z",
    },
    {
      id: "a4",
      lessonId: "lesson-2",
      exerciseId: "ex-3",
      assessmentType: "transfer",
      answer: "miss",
      passed: false,
      attemptedAt: "2025-01-01T03:00:00.000Z",
    },
    {
      id: "a5",
      lessonId: "lesson-2",
      exerciseId: "ex-3",
      assessmentType: "transfer",
      answer: "miss again",
      passed: false,
      attemptedAt: "2025-01-01T04:00:00.000Z",
    },
  ];

  it("calculates recovery and unresolved counts across all attempts", () => {
    const summary = buildAttemptAnalyticsSummary(attempts);

    expect(summary.attemptCount).toBe(5);
    expect(summary.failedAttempts).toBe(3);
    expect(summary.passedAttempts).toBe(2);
    expect(summary.exercisesTracked).toBe(3);
    expect(summary.firstPassExercises).toBe(1);
    expect(summary.recoveredExercises).toBe(1);
    expect(summary.unresolvedExercises).toBe(1);
    expect(summary.errorReductionRate).toBe(50);
    expect(summary.breakdown[0].assessmentType).toBe("debugging");
    expect(summary.breakdown[0].recoveries).toBe(1);
  });

  it("filters to a lesson when requested", () => {
    const summary = buildAttemptAnalyticsSummary(attempts, "lesson-1");

    expect(summary.attemptCount).toBe(3);
    expect(summary.unresolvedExercises).toBe(0);
    expect(summary.recoveredExercises).toBe(1);
    expect(summary.breakdown.map((entry) => entry.assessmentType)).toEqual(
      expect.arrayContaining(["debugging", "reasoning"]),
    );
  });
});