import type { PhaseExitEvaluation } from "./progression-engine";

export type MilestoneGate = {
  id: "competency" | "transfer" | "reinforcement";
  label: string;
  passed: boolean;
  detail: string;
};

export type PhaseMilestoneStatus = {
  gates: MilestoneGate[];
  competencyGatePassed: boolean;
  transferGatePassed: boolean;
  reinforcementGatePassed: boolean;
  blockedReasons: string[];
  allPassed: boolean;
  nextPhaseTitle: string | null;
};

export function evaluatePhaseMilestoneStatus(
  phaseExitStatus: PhaseExitEvaluation | null,
  reinforcementPendingCount: number,
): PhaseMilestoneStatus | null {
  if (!phaseExitStatus) return null;

  const reinforcementGatePassed = reinforcementPendingCount === 0;
  const gates: MilestoneGate[] = [
    {
      id: "competency",
      label: "Competency gates",
      passed: phaseExitStatus.competencyGatesPassed,
      detail: phaseExitStatus.competencyGatesPassed
        ? "Required competency thresholds met"
        : "One or more competency thresholds still need work",
    },
    {
      id: "transfer",
      label: "Transfer evidence",
      passed: phaseExitStatus.transferGatePassed,
      detail: phaseExitStatus.transferGatePassed
        ? "Transfer evidence requirement satisfied"
        : "At least one transfer challenge still needs to pass",
    },
    {
      id: "reinforcement",
      label: "Reinforcement queue",
      passed: reinforcementGatePassed,
      detail: reinforcementGatePassed
        ? "No weak-skill reinforcement items are currently overdue"
        : `${reinforcementPendingCount} reinforcement item${reinforcementPendingCount === 1 ? "" : "s"} still overdue`,
    },
  ];

  const blockedReasons = gates.filter((gate) => !gate.passed).map((gate) => gate.detail);

  return {
    gates,
    competencyGatePassed: phaseExitStatus.competencyGatesPassed,
    transferGatePassed: phaseExitStatus.transferGatePassed,
    reinforcementGatePassed,
    blockedReasons,
    allPassed:
      phaseExitStatus.competencyGatesPassed &&
      phaseExitStatus.transferGatePassed &&
      reinforcementGatePassed,
    nextPhaseTitle: phaseExitStatus.nextPhase?.title ?? null,
  };
}