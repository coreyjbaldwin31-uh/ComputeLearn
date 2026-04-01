import { useMemo } from "react";
import type { Curriculum, Lesson } from "@/data/curriculum";
import type { ArtifactRecord } from "@/lib/artifact-engine";
import type { AttemptRecord } from "@/lib/artifact-engine";
import type { ReviewRecord } from "@/lib/progression-engine";
import { buildAttemptAnalyticsSummary } from "@/lib/attempt-analytics-engine";
import { buildPhaseStatusRecords } from "@/lib/phase-status-engine";
import { buildArtifactBrowserSummary } from "@/lib/artifact-browser-engine";
import { buildArtifactCompletionSummary } from "@/lib/artifact-completion-engine";
import { buildCompetencyDashboardSummary } from "@/lib/competency-dashboard-engine";
import { buildPhaseTransferAnalytics } from "@/lib/transfer-analytics-engine";
import { buildMilestonePassRateSummary } from "@/lib/milestone-pass-rate-engine";
import { buildIndependentReadinessSummary } from "@/lib/independent-readiness-engine";
import { buildIndependentLabSummary } from "@/lib/independent-lab-engine";
import { buildOutcomesDashboardSummary } from "@/lib/outcomes-dashboard-engine";

type AnalyticsDashboardsConfig = {
  curriculum: Curriculum;
  progress: Record<string, true>;
  transferProgress: Record<string, true>;
  competencyLevels: Record<string, number>;
  reviews: Record<string, ReviewRecord>;
  attempts: AttemptRecord[];
  artifacts: ArtifactRecord[];
  selectedLesson: Lesson | undefined;
};

export function useAnalyticsDashboards(config: AnalyticsDashboardsConfig) {
  const {
    curriculum,
    progress,
    transferProgress,
    competencyLevels,
    reviews,
    attempts,
    artifacts,
    selectedLesson,
  } = config;

  const recentAttempts = useMemo(() => {
    if (!selectedLesson) return [];
    return attempts
      .filter((attempt) => attempt.lessonId === selectedLesson.id)
      .slice(0, 5);
  }, [attempts, selectedLesson]);

  const recentArtifacts = useMemo(() => {
    if (!selectedLesson) return [];
    return artifacts
      .filter((artifact) => artifact.lessonId === selectedLesson.id)
      .slice(0, 4);
  }, [artifacts, selectedLesson]);

  const attemptAnalytics = useMemo(
    () => buildAttemptAnalyticsSummary(attempts),
    [attempts],
  );

  const lessonAttemptAnalytics = useMemo(
    () => buildAttemptAnalyticsSummary(attempts, selectedLesson?.id),
    [attempts, selectedLesson?.id],
  );

  const phaseStatuses = useMemo(
    () =>
      buildPhaseStatusRecords(
        curriculum,
        progress,
        transferProgress,
        competencyLevels,
        reviews,
      ),
    [curriculum, progress, transferProgress, competencyLevels, reviews],
  );

  const lessonArtifactSummary = useMemo(
    () => buildArtifactBrowserSummary(artifacts, selectedLesson?.id),
    [artifacts, selectedLesson?.id],
  );

  const artifactCompletionSummary = useMemo(
    () => buildArtifactCompletionSummary(curriculum, progress, artifacts),
    [artifacts, curriculum, progress],
  );

  const competencyDashboard = useMemo(
    () => buildCompetencyDashboardSummary(competencyLevels),
    [competencyLevels],
  );

  const phaseTransferAnalytics = useMemo(
    () => buildPhaseTransferAnalytics(curriculum, transferProgress),
    [curriculum, transferProgress],
  );

  const milestonePassRateSummary = useMemo(
    () => buildMilestonePassRateSummary(phaseStatuses),
    [phaseStatuses],
  );

  const independentReadiness = useMemo(
    () =>
      buildIndependentReadinessSummary(
        curriculum,
        progress,
        transferProgress,
        competencyLevels,
        artifacts,
      ),
    [artifacts, competencyLevels, curriculum, progress, transferProgress],
  );

  const independentLabSummary = useMemo(
    () =>
      buildIndependentLabSummary(
        curriculum,
        progress,
        transferProgress,
        attempts,
      ),
    [attempts, curriculum, progress, transferProgress],
  );

  const outcomesDashboardSummary = useMemo(
    () =>
      buildOutcomesDashboardSummary({
        transferAnalytics: phaseTransferAnalytics,
        independentLabSummary,
        attemptAnalytics,
        milestonePassRateSummary,
        artifactCompletionSummary,
      }),
    [
      artifactCompletionSummary,
      attemptAnalytics,
      independentLabSummary,
      milestonePassRateSummary,
      phaseTransferAnalytics,
    ],
  );

  return {
    recentAttempts,
    recentArtifacts,
    attemptAnalytics,
    lessonAttemptAnalytics,
    phaseStatuses,
    lessonArtifactSummary,
    artifactCompletionSummary,
    competencyDashboard,
    phaseTransferAnalytics,
    milestonePassRateSummary,
    independentReadiness,
    independentLabSummary,
    outcomesDashboardSummary,
  };
}
