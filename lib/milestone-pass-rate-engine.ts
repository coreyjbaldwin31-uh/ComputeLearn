import type { PhaseStatusRecord } from "./phase-status-engine";

export type MilestonePassRateSummary = {
  totalPhases: number;
  passedPhases: number;
  blockedPhases: number;
  passRate: number;
  statusCounts: {
    notStarted: number;
    inProgress: number;
    reviewNeeded: number;
    ready: number;
  };
  blockedPhaseTitles: string[];
};

function toRate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

export function buildMilestonePassRateSummary(
  phaseStatuses: PhaseStatusRecord[],
): MilestonePassRateSummary {
  const passedPhases = phaseStatuses.filter((phase) => phase.readyToAdvance).length;
  const blockedPhaseTitles = phaseStatuses
    .filter((phase) => !phase.readyToAdvance)
    .map((phase) => phase.title);

  return {
    totalPhases: phaseStatuses.length,
    passedPhases,
    blockedPhases: phaseStatuses.length - passedPhases,
    passRate: toRate(passedPhases, phaseStatuses.length),
    statusCounts: {
      notStarted: phaseStatuses.filter((phase) => phase.statusLabel === "not-started").length,
      inProgress: phaseStatuses.filter((phase) => phase.statusLabel === "in-progress").length,
      reviewNeeded: phaseStatuses.filter((phase) => phase.statusLabel === "review-needed").length,
      ready: phaseStatuses.filter((phase) => phase.statusLabel === "ready").length,
    },
    blockedPhaseTitles,
  };
}
