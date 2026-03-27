import type { AttemptRecord } from "./artifact-engine";

export type AttemptAssessmentBreakdown = {
  assessmentType: string;
  attempts: number;
  failures: number;
  recoveries: number;
};

export type AttemptAnalyticsSummary = {
  attemptCount: number;
  failedAttempts: number;
  passedAttempts: number;
  exercisesTracked: number;
  firstPassExercises: number;
  recoveredExercises: number;
  unresolvedExercises: number;
  errorReductionRate: number;
  breakdown: AttemptAssessmentBreakdown[];
};

export function buildAttemptAnalyticsSummary(
  attempts: AttemptRecord[],
  lessonId?: string,
): AttemptAnalyticsSummary {
  const filtered = lessonId
    ? attempts.filter((attempt) => attempt.lessonId === lessonId)
    : attempts;
  const grouped = new Map<string, AttemptRecord[]>();

  for (const attempt of filtered) {
    const group = grouped.get(attempt.exerciseId) ?? [];
    group.push(attempt);
    grouped.set(attempt.exerciseId, group);
  }

  let firstPassExercises = 0;
  let recoveredExercises = 0;
  let unresolvedExercises = 0;
  let exercisesWithInitialFailure = 0;

  const breakdownMap = new Map<string, AttemptAssessmentBreakdown>();

  for (const group of grouped.values()) {
    const sorted = [...group].sort(
      (a, b) => Date.parse(a.attemptedAt) - Date.parse(b.attemptedAt),
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    if (first.passed) {
      firstPassExercises += 1;
    } else {
      exercisesWithInitialFailure += 1;
      if (last.passed) {
        recoveredExercises += 1;
      } else {
        unresolvedExercises += 1;
      }
    }

    for (const attempt of sorted) {
      const entry = breakdownMap.get(attempt.assessmentType) ?? {
        assessmentType: attempt.assessmentType,
        attempts: 0,
        failures: 0,
        recoveries: 0,
      };
      entry.attempts += 1;
      if (!attempt.passed) {
        entry.failures += 1;
      }
      breakdownMap.set(attempt.assessmentType, entry);
    }

    if (!first.passed && last.passed) {
      const latestType = last.assessmentType;
      const entry = breakdownMap.get(latestType);
      if (entry) {
        entry.recoveries += 1;
      }
    }
  }

  return {
    attemptCount: filtered.length,
    failedAttempts: filtered.filter((attempt) => !attempt.passed).length,
    passedAttempts: filtered.filter((attempt) => attempt.passed).length,
    exercisesTracked: grouped.size,
    firstPassExercises,
    recoveredExercises,
    unresolvedExercises,
    errorReductionRate:
      exercisesWithInitialFailure === 0
        ? 0
        : Math.round((recoveredExercises / exercisesWithInitialFailure) * 100),
    breakdown: Array.from(breakdownMap.values()).sort(
      (a, b) => b.attempts - a.attempts || a.assessmentType.localeCompare(b.assessmentType),
    ),
  };
}