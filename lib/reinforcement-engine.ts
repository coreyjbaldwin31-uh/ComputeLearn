import type { Lesson } from "@/data/curriculum";
import {
    getNextReviewDays,
    isDueForReview,
    type LessonEntry,
    type ReviewRecord,
} from "./progression-engine";

export type ReinforcementRecommendation = {
  entry: LessonEntry;
  weakTracks: string[];
  dueSinceDays: number;
  reviewCount: number;
  score: number;
};

export function getWeakTrackHits(
  lesson: Lesson,
  weakTracks: string[],
): string[] {
  const lessonTracks = lesson.competencies?.map((item) => item.track) ?? [];
  return lessonTracks.filter((track) => weakTracks.includes(track));
}

function getDueSinceDays(record: ReviewRecord, nowTimestamp: number): number {
  const base = record.lastReviewedAt ?? record.completedAt;
  const dueAt = new Date(base);
  dueAt.setDate(dueAt.getDate() + getNextReviewDays(record.reviewCount));
  const diffMs = nowTimestamp - dueAt.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function getReinforcementQueue(
  entries: LessonEntry[],
  reviews: Record<string, ReviewRecord>,
  weakTracks: string[],
  nowTimestamp: number = Date.now(),
  limit: number = 5,
): ReinforcementRecommendation[] {
  if (weakTracks.length === 0 || limit <= 0) return [];

  const recommendations: ReinforcementRecommendation[] = [];

  for (const entry of entries) {
    const record = reviews[entry.lesson.id];
    if (record == null || !isDueForReview(record, nowTimestamp)) continue;

    const hits = getWeakTrackHits(entry.lesson, weakTracks);
    if (hits.length === 0) continue;

    const dueSinceDays = getDueSinceDays(record, nowTimestamp);
    const score =
      hits.length * 100 + dueSinceDays * 5 + Math.max(0, 4 - record.reviewCount);

    recommendations.push({
      entry,
      weakTracks: hits,
      dueSinceDays,
      reviewCount: record.reviewCount,
      score,
    });
  }

  return recommendations
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.dueSinceDays !== a.dueSinceDays) {
        return b.dueSinceDays - a.dueSinceDays;
      }
      return a.entry.lesson.title.localeCompare(b.entry.lesson.title);
    })
    .slice(0, limit);
}
