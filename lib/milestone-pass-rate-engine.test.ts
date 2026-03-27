import { describe, expect, it } from "vitest";
import { buildMilestonePassRateSummary } from "./milestone-pass-rate-engine";

describe("buildMilestonePassRateSummary", () => {
  it("calculates pass rate and status breakdown", () => {
    const summary = buildMilestonePassRateSummary([
      {
        phaseId: "p1",
        title: "Phase 1",
        completedLessons: 5,
        totalLessons: 5,
        transferEvidence: 1,
        transferLessons: 1,
        reinforcementPendingCount: 0,
        readyToAdvance: true,
        statusLabel: "ready",
      },
      {
        phaseId: "p2",
        title: "Phase 2",
        completedLessons: 4,
        totalLessons: 6,
        transferEvidence: 0,
        transferLessons: 1,
        reinforcementPendingCount: 1,
        readyToAdvance: false,
        statusLabel: "review-needed",
      },
      {
        phaseId: "p3",
        title: "Phase 3",
        completedLessons: 0,
        totalLessons: 4,
        transferEvidence: 0,
        transferLessons: 0,
        reinforcementPendingCount: 0,
        readyToAdvance: false,
        statusLabel: "not-started",
      },
    ]);

    expect(summary.totalPhases).toBe(3);
    expect(summary.passedPhases).toBe(1);
    expect(summary.blockedPhases).toBe(2);
    expect(summary.passRate).toBe(33);
    expect(summary.statusCounts.ready).toBe(1);
    expect(summary.statusCounts.reviewNeeded).toBe(1);
    expect(summary.statusCounts.notStarted).toBe(1);
    expect(summary.blockedPhaseTitles).toEqual(["Phase 2", "Phase 3"]);
  });

  it("returns zeros when there are no phases", () => {
    const summary = buildMilestonePassRateSummary([]);

    expect(summary.totalPhases).toBe(0);
    expect(summary.passedPhases).toBe(0);
    expect(summary.blockedPhases).toBe(0);
    expect(summary.passRate).toBe(0);
    expect(summary.blockedPhaseTitles).toEqual([]);
  });
});
