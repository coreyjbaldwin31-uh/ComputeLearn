/**
 * Pure functions for competency record management.
 * Competency records represent a learner's demonstrated mastery level in a
 * tracked engineering skill domain.
 */

export type CompetencyRecord = {
  track: string;
  displayName: string;
  level: string;
  earnedAt: string;
};

/**
 * Canonical mastery level ordering from lowest to highest.
 * Used for comparisons throughout this module.
 */
export const MASTERY_LEVEL_ORDER = [
  "Unstarted",
  "Aware",
  "Assisted",
  "Functional",
  "Independent",
] as const;

/**
 * Returns the numeric rank of a mastery level (higher is better).
 * Returns -1 if the level is unrecognised.
 */
export function getMasteryRank(level: string): number {
  return MASTERY_LEVEL_ORDER.indexOf(
    level as (typeof MASTERY_LEVEL_ORDER)[number],
  );
}

/**
 * Returns true when the mastery level meets or exceeds the Functional threshold.
 */
export function isMasteryPassing(level: string): boolean {
  return getMasteryRank(level) >= getMasteryRank("Functional");
}

/**
 * Returns competency tracks whose level is strictly below the given threshold.
 * Useful for surfacing areas that need reinforcement in the retention system.
 */
export function getWeakCompetencyTracks(
  competencyLevels: Record<string, string>,
  belowLevel: string,
): string[] {
  const threshold = getMasteryRank(belowLevel);
  return Object.entries(competencyLevels)
    .filter(([, level]) => getMasteryRank(level) < threshold)
    .map(([track]) => track);
}

/**
 * Builds a CompetencyRecord from component parts.
 */
export function buildCompetencyRecord(
  track: string,
  displayName: string,
  level: string,
  earnedAt: string,
): CompetencyRecord {
  return { track, displayName, level, earnedAt };
}

/**
 * Converts a flat competency level map into a sorted array of CompetencyRecords,
 * highest mastery level first.
 */
export function toSortedCompetencyRecords(
  competencyLevels: Record<string, string>,
  formatName: (track: string) => string,
  timestamp: string,
): CompetencyRecord[] {
  return Object.entries(competencyLevels)
    .map(([track, level]) =>
      buildCompetencyRecord(track, formatName(track), level, timestamp),
    )
    .sort((a, b) => getMasteryRank(b.level) - getMasteryRank(a.level));
}
