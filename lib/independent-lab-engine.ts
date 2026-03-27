import type { Curriculum } from "@/data/curriculum";
import type { AttemptRecord } from "./artifact-engine";

export type IndependentLabPhaseSummary = {
  phaseId: string;
  phaseTitle: string;
  totalLabs: number;
  completedLabs: number;
  validatedLabs: number;
  firstPassLabs: number;
  completionRate: number;
};

export type IndependentLabSummary = {
  totalLabs: number;
  completedLabs: number;
  validatedLabs: number;
  firstPassLabs: number;
  completionRate: number;
  phaseBreakdown: IndependentLabPhaseSummary[];
};

function toRate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

export function buildIndependentLabSummary(
  curriculum: Curriculum,
  progress: Record<string, true>,
  transferProgress: Record<string, true>,
  attempts: AttemptRecord[],
): IndependentLabSummary {
  const attemptsByExerciseId = new Map<string, AttemptRecord[]>();

  for (const attempt of attempts) {
    const group = attemptsByExerciseId.get(attempt.exerciseId) ?? [];
    group.push(attempt);
    attemptsByExerciseId.set(attempt.exerciseId, group);
  }

  const phaseBreakdown = curriculum.phases.map((phase) => {
    const ticketLessons = phase.courses
      .flatMap((course) => course.lessons)
      .filter((lesson) => lesson.scaffoldingLevel === "ticket-style");

    const completedLabs = ticketLessons.filter((lesson) => {
      const transferPassed =
        lesson.transferTask == null || Boolean(transferProgress[lesson.id]);
      return Boolean(progress[lesson.id]) && transferPassed;
    }).length;

    const validatedLabs = ticketLessons.filter((lesson) => {
      const exerciseIds = [
        ...lesson.exercises.map((exercise) => exercise.id),
        ...(lesson.transferTask ? [lesson.transferTask.id] : []),
      ];
      return exerciseIds.every((exerciseId) => {
        const exerciseAttempts = attemptsByExerciseId.get(exerciseId) ?? [];
        return exerciseAttempts.some((attempt) => attempt.passed);
      });
    }).length;

    const firstPassLabs = ticketLessons.filter((lesson) => {
      const exerciseIds = [
        ...lesson.exercises.map((exercise) => exercise.id),
        ...(lesson.transferTask ? [lesson.transferTask.id] : []),
      ];

      return exerciseIds.every((exerciseId) => {
        const exerciseAttempts = [
          ...(attemptsByExerciseId.get(exerciseId) ?? []),
        ].sort(
          (a, b) => Date.parse(a.attemptedAt) - Date.parse(b.attemptedAt),
        );
        if (exerciseAttempts.length === 0) {
          return false;
        }
        return exerciseAttempts[0].passed;
      });
    }).length;

    return {
      phaseId: phase.id,
      phaseTitle: phase.title,
      totalLabs: ticketLessons.length,
      completedLabs,
      validatedLabs,
      firstPassLabs,
      completionRate: toRate(completedLabs, ticketLessons.length),
    };
  });

  const totals = phaseBreakdown.reduce(
    (acc, phase) => {
      acc.totalLabs += phase.totalLabs;
      acc.completedLabs += phase.completedLabs;
      acc.validatedLabs += phase.validatedLabs;
      acc.firstPassLabs += phase.firstPassLabs;
      return acc;
    },
    {
      totalLabs: 0,
      completedLabs: 0,
      validatedLabs: 0,
      firstPassLabs: 0,
    },
  );

  return {
    ...totals,
    completionRate: toRate(totals.completedLabs, totals.totalLabs),
    phaseBreakdown,
  };
}
