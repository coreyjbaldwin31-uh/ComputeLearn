import type { Curriculum } from "@/data/curriculum";
import type { ArtifactRecord } from "./artifact-engine";

export type ArtifactCompletionSummary = {
  completedLessons: number;
  lessonsWithEvidence: number;
  lessonsMissingEvidence: number;
  completionRate: number;
  evidenceCoverageByPhase: Array<{
    phaseId: string;
    phaseTitle: string;
    completedLessons: number;
    lessonsWithEvidence: number;
    completionRate: number;
  }>;
};

function toRate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

export function buildArtifactCompletionSummary(
  curriculum: Curriculum,
  progress: Record<string, true>,
  artifacts: ArtifactRecord[],
): ArtifactCompletionSummary {
  const evidenceLessonIds = new Set(
    artifacts
      .filter((artifact) => artifact.type !== "completion")
      .map((artifact) => artifact.lessonId),
  );

  const phaseSummaries = curriculum.phases.map((phase) => {
    const lessonIds = phase.courses
      .flatMap((course) => course.lessons)
      .map((lesson) => lesson.id);
    const completedLessonIds = lessonIds.filter((lessonId) => progress[lessonId]);
    const lessonsWithEvidence = completedLessonIds.filter((lessonId) =>
      evidenceLessonIds.has(lessonId),
    ).length;

    return {
      phaseId: phase.id,
      phaseTitle: phase.title,
      completedLessons: completedLessonIds.length,
      lessonsWithEvidence,
      completionRate: toRate(lessonsWithEvidence, completedLessonIds.length),
    };
  });

  const completedLessons = phaseSummaries.reduce(
    (sum, phase) => sum + phase.completedLessons,
    0,
  );
  const lessonsWithEvidence = phaseSummaries.reduce(
    (sum, phase) => sum + phase.lessonsWithEvidence,
    0,
  );

  return {
    completedLessons,
    lessonsWithEvidence,
    lessonsMissingEvidence: completedLessons - lessonsWithEvidence,
    completionRate: toRate(lessonsWithEvidence, completedLessons),
    evidenceCoverageByPhase: phaseSummaries,
  };
}