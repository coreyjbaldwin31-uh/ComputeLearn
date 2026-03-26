import type { Curriculum } from "@/data/curriculum";

export type ReviewRecord = {
  completedAt: string;
  lastReviewedAt: string | null;
  reviewCount: number;
};

export type MasteryLevel =
  | "unstarted"
  | "aware"
  | "assisted"
  | "functional"
  | "independent";

export function getNextReviewDays(reviewCount: number): number {
  if (reviewCount === 0) return 1;
  if (reviewCount === 1) return 3;
  if (reviewCount === 2) return 7;
  if (reviewCount === 3) return 14;
  return 30;
}

export function isDueForReview(
  record: ReviewRecord,
  nowTimestamp: number = Date.now(),
): boolean {
  const base = record.lastReviewedAt ?? record.completedAt;
  const due = new Date(base);
  due.setDate(due.getDate() + getNextReviewDays(record.reviewCount));
  return nowTimestamp >= due.getTime();
}

export function getMasteryLevel(count: number): MasteryLevel {
  if (count === 0) return "unstarted";
  if (count < 4) return "aware";
  if (count < 8) return "assisted";
  if (count < 15) return "functional";
  return "independent";
}

export function getLevelThreshold(level: string): number {
  switch (level.toLowerCase()) {
    case "aware":
      return 2;
    case "assisted":
      return 5;
    case "functional":
      return 8;
    case "independent":
      return 12;
    default:
      return 999;
  }
}

export function formatTrackName(track: string): string {
  return track.replace(/([A-Z])/g, " $1").trim();
}

export function calculateActivityStreak(
  reviews: Record<string, ReviewRecord>,
  now: Date = new Date(),
): number {
  const activityDays = new Set<string>();

  for (const record of Object.values(reviews)) {
    activityDays.add(record.completedAt.split("T")[0]);
    if (record.lastReviewedAt) {
      activityDays.add(record.lastReviewedAt.split("T")[0]);
    }
  }

  if (activityDays.size === 0) return 0;

  const today = new Date(now);
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (!activityDays.has(todayStr) && !activityDays.has(yesterdayStr)) {
    return 0;
  }

  let checkDate = activityDays.has(todayStr) ? today : yesterday;
  let streak = 0;

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (!activityDays.has(dateStr)) break;
    streak++;
    checkDate = new Date(checkDate);
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export function calculateCompetencyLevels(
  curriculum: Curriculum,
  progress: Record<string, true>,
): Record<string, number> {
  const store: Record<string, number> = {};

  for (const phase of curriculum.phases) {
    for (const course of phase.courses) {
      for (const lesson of course.lessons) {
        if (!progress[lesson.id] || !lesson.competencies) continue;
        for (const competency of lesson.competencies) {
          store[competency.track] =
            (store[competency.track] ?? 0) + lesson.exercises.length;
        }
      }
    }
  }

  return store;
}