import type { ArtifactCompletionSummary } from "./artifact-completion-engine";
import type { AttemptAnalyticsSummary } from "./attempt-analytics-engine";
import type { IndependentLabSummary } from "./independent-lab-engine";
import type { MilestonePassRateSummary } from "./milestone-pass-rate-engine";
import type { PhaseTransferAnalytics } from "./transfer-analytics-engine";

type MetricStatus = "strong" | "watch" | "critical";

export type OutcomeMetricSnapshot = {
  id:
    | "transfer"
    | "independent-labs"
    | "error-reduction"
    | "milestone-pass"
    | "artifact-coverage";
  label: string;
  value: number;
  status: MetricStatus;
};

export type OutcomesDashboardSummary = {
  overallScore: number;
  status: MetricStatus;
  snapshots: OutcomeMetricSnapshot[];
  prioritizedActions: string[];
};

function average(values: number[]): number {
  return values.length === 0
    ? 0
    : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function metricStatus(value: number): MetricStatus {
  if (value >= 80) return "strong";
  if (value >= 60) return "watch";
  return "critical";
}

export function buildOutcomesDashboardSummary(params: {
  transferAnalytics: PhaseTransferAnalytics[];
  independentLabSummary: IndependentLabSummary;
  attemptAnalytics: AttemptAnalyticsSummary;
  milestonePassRateSummary: MilestonePassRateSummary;
  artifactCompletionSummary: ArtifactCompletionSummary;
}): OutcomesDashboardSummary {
  const transferRate = average(params.transferAnalytics.map((entry) => entry.passRate));

  const snapshots: OutcomeMetricSnapshot[] = [
    {
      id: "transfer",
      label: "Transfer pass rate",
      value: transferRate,
      status: metricStatus(transferRate),
    },
    {
      id: "independent-labs",
      label: "Independent lab completion",
      value: params.independentLabSummary.completionRate,
      status: metricStatus(params.independentLabSummary.completionRate),
    },
    {
      id: "error-reduction",
      label: "Repeated error reduction",
      value: params.attemptAnalytics.errorReductionRate,
      status: metricStatus(params.attemptAnalytics.errorReductionRate),
    },
    {
      id: "milestone-pass",
      label: "Milestone pass rate",
      value: params.milestonePassRateSummary.passRate,
      status: metricStatus(params.milestonePassRateSummary.passRate),
    },
    {
      id: "artifact-coverage",
      label: "Artifact completion rate",
      value: params.artifactCompletionSummary.completionRate,
      status: metricStatus(params.artifactCompletionSummary.completionRate),
    },
  ];

  const weightedScore = Math.round(
    transferRate * 0.25 +
      params.milestonePassRateSummary.passRate * 0.25 +
      params.independentLabSummary.completionRate * 0.2 +
      params.attemptAnalytics.errorReductionRate * 0.15 +
      params.artifactCompletionSummary.completionRate * 0.15,
  );

  const prioritizedActions: string[] = [];

  if (transferRate < 70) {
    prioritizedActions.push(
      "Raise transfer pass rate by targeting failed transfer prompts with inspect-mode retries.",
    );
  }
  if (params.independentLabSummary.completionRate < 70) {
    prioritizedActions.push(
      "Increase ticket-style lab completion with focused independent-build sessions.",
    );
  }
  if (params.attemptAnalytics.errorReductionRate < 70) {
    prioritizedActions.push(
      "Reduce repeated errors by converting unresolved checks into reinforcement practice.",
    );
  }
  if (params.milestonePassRateSummary.passRate < 70) {
    prioritizedActions.push(
      "Unblock milestone gates by resolving review-needed phases first.",
    );
  }
  if (params.artifactCompletionSummary.completionRate < 70) {
    prioritizedActions.push(
      "Improve artifact coverage by saving notes or reflections for completed lessons.",
    );
  }

  if (prioritizedActions.length === 0) {
    prioritizedActions.push(
      "Maintain momentum: keep validating transfer tasks and documenting project decisions.",
    );
  }

  return {
    overallScore: weightedScore,
    status: metricStatus(weightedScore),
    snapshots,
    prioritizedActions,
  };
}