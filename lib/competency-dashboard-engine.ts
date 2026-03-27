import { getWeakCompetencyTracks } from "./competency-engine";
import { formatTrackName, getMasteryLevel } from "./progression-engine";

export type CompetencyDashboardRecord = {
  track: string;
  displayName: string;
  count: number;
  level: string;
  isWeak: boolean;
};

export type CompetencyDashboardSummary = {
  records: CompetencyDashboardRecord[];
  weakCount: number;
  passingCount: number;
};

export function buildCompetencyDashboardSummary(
  competencyLevels: Record<string, number>,
): CompetencyDashboardSummary {
  const mapped = Object.fromEntries(
    Object.entries(competencyLevels).map(([track, count]) => [
      track,
      getMasteryLevel(count),
    ]),
  );
  const weakTracks = new Set(getWeakCompetencyTracks(mapped, "Functional"));

  const records = Object.entries(competencyLevels)
    .map(([track, count]) => ({
      track,
      displayName: formatTrackName(track),
      count,
      level: getMasteryLevel(count),
      isWeak: weakTracks.has(track),
    }))
    .sort((a, b) => b.count - a.count || a.displayName.localeCompare(b.displayName));

  return {
    records,
    weakCount: records.filter((record) => record.isWeak).length,
    passingCount: records.filter((record) => !record.isWeak).length,
  };
}
