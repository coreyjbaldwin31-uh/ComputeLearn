import { describe, expect, it } from "vitest";
import { buildOutcomesDashboardSummary } from "./outcomes-dashboard-engine";

describe("buildOutcomesDashboardSummary", () => {
  it("builds weighted score and prioritized actions for weak areas", () => {
    const summary = buildOutcomesDashboardSummary({
      transferAnalytics: [
        { phaseId: "p1", phaseTitle: "P1", totalTransferLessons: 2, passedTransferLessons: 1, passRate: 50 },
        { phaseId: "p2", phaseTitle: "P2", totalTransferLessons: 2, passedTransferLessons: 2, passRate: 100 },
      ],
      independentLabSummary: {
        totalLabs: 4,
        completedLabs: 2,
        validatedLabs: 1,
        firstPassLabs: 0,
        completionRate: 50,
        phaseBreakdown: [],
      },
      attemptAnalytics: {
        attemptCount: 20,
        failedAttempts: 8,
        passedAttempts: 12,
        exercisesTracked: 6,
        firstPassExercises: 2,
        recoveredExercises: 2,
        unresolvedExercises: 2,
        errorReductionRate: 50,
        breakdown: [],
      },
      milestonePassRateSummary: {
        totalPhases: 4,
        passedPhases: 1,
        blockedPhases: 3,
        passRate: 25,
        statusCounts: {
          notStarted: 1,
          inProgress: 1,
          reviewNeeded: 1,
          ready: 1,
        },
        blockedPhaseTitles: ["P2", "P3", "P4"],
      },
      artifactCompletionSummary: {
        completedLessons: 10,
        lessonsWithEvidence: 5,
        lessonsMissingEvidence: 5,
        completionRate: 50,
        evidenceCoverageByPhase: [],
      },
    });

    expect(summary.overallScore).toBeLessThan(70);
    expect(summary.status).toBe("critical");
    expect(summary.snapshots).toHaveLength(5);
    expect(summary.prioritizedActions.length).toBeGreaterThan(2);
  });

  it("returns maintenance guidance when metrics are already strong", () => {
    const summary = buildOutcomesDashboardSummary({
      transferAnalytics: [
        { phaseId: "p1", phaseTitle: "P1", totalTransferLessons: 2, passedTransferLessons: 2, passRate: 100 },
      ],
      independentLabSummary: {
        totalLabs: 4,
        completedLabs: 4,
        validatedLabs: 4,
        firstPassLabs: 4,
        completionRate: 100,
        phaseBreakdown: [],
      },
      attemptAnalytics: {
        attemptCount: 10,
        failedAttempts: 1,
        passedAttempts: 9,
        exercisesTracked: 5,
        firstPassExercises: 4,
        recoveredExercises: 1,
        unresolvedExercises: 0,
        errorReductionRate: 100,
        breakdown: [],
      },
      milestonePassRateSummary: {
        totalPhases: 4,
        passedPhases: 4,
        blockedPhases: 0,
        passRate: 100,
        statusCounts: {
          notStarted: 0,
          inProgress: 0,
          reviewNeeded: 0,
          ready: 4,
        },
        blockedPhaseTitles: [],
      },
      artifactCompletionSummary: {
        completedLessons: 10,
        lessonsWithEvidence: 10,
        lessonsMissingEvidence: 0,
        completionRate: 100,
        evidenceCoverageByPhase: [],
      },
    });

    expect(summary.overallScore).toBe(100);
    expect(summary.status).toBe("strong");
    expect(summary.prioritizedActions).toEqual([
      "Maintain momentum: keep validating transfer tasks and documenting project decisions.",
    ]);
  });
});