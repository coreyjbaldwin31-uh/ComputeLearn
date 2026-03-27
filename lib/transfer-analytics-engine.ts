import type { Curriculum } from "@/data/curriculum";

export type PhaseTransferAnalytics = {
  phaseId: string;
  phaseTitle: string;
  totalTransferLessons: number;
  passedTransferLessons: number;
  passRate: number;
};

export function buildPhaseTransferAnalytics(
  curriculum: Curriculum,
  transferProgress: Record<string, true>,
): PhaseTransferAnalytics[] {
  return curriculum.phases.map((phase) => {
    const lessons = phase.courses.flatMap((course) => course.lessons);
    const transferLessons = lessons.filter((lesson) => lesson.transferTask != null);
    const passedTransferLessons = transferLessons.filter(
      (lesson) => transferProgress[lesson.id],
    ).length;
    const totalTransferLessons = transferLessons.length;
    const passRate =
      totalTransferLessons === 0
        ? 0
        : Math.round((passedTransferLessons / totalTransferLessons) * 100);

    return {
      phaseId: phase.id,
      phaseTitle: phase.title,
      totalTransferLessons,
      passedTransferLessons,
      passRate,
    };
  });
}