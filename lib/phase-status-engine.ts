import type { Curriculum } from "@/data/curriculum";
import { getWeakCompetencyTracks } from "./competency-engine";
import { evaluatePhaseMilestoneStatus } from "./milestone-engine";
import {
  evaluatePhaseExitStatus,
  flattenLessonEntries,
  getMasteryLevel,
  getPhaseProgressSnapshot,
  type ReviewRecord,
} from "./progression-engine";
import { getReinforcementQueue } from "./reinforcement-engine";

export type PhaseStatusRecord = {
  phaseId: string;
  title: string;
  completedLessons: number;
  totalLessons: number;
  transferEvidence: number;
  transferLessons: number;
  reinforcementPendingCount: number;
  readyToAdvance: boolean;
  statusLabel: "not-started" | "in-progress" | "review-needed" | "ready";
};

export function buildPhaseStatusRecords(
  curriculum: Curriculum,
  progress: Record<string, true>,
  transferProgress: Record<string, true>,
  competencyLevels: Record<string, number>,
  reviews: Record<string, ReviewRecord>,
  nowTimestamp: number = Date.now(),
): PhaseStatusRecord[] {
  const entries = flattenLessonEntries(curriculum);
  const weakTracks = getWeakCompetencyTracks(
    Object.fromEntries(
      Object.entries(competencyLevels).map(([track, count]) => [
        track,
        getMasteryLevel(count),
      ]),
    ),
    "Functional",
  );

  return curriculum.phases.map((phase) => {
    const snapshot = getPhaseProgressSnapshot(phase, progress, transferProgress);
    const phaseEntries = entries.filter((entry) => entry.phase.id === phase.id);
    const reinforcementPendingCount = getReinforcementQueue(
      phaseEntries,
      reviews,
      weakTracks,
      nowTimestamp,
    ).length;
    const phaseExitStatus = evaluatePhaseExitStatus(
      curriculum,
      phase.id,
      competencyLevels,
      snapshot.transferEvidence,
      snapshot.transferLessons,
    );
    const milestoneStatus = evaluatePhaseMilestoneStatus(
      phaseExitStatus,
      reinforcementPendingCount,
    );

    let statusLabel: PhaseStatusRecord["statusLabel"] = "not-started";
    if (snapshot.completedLessons > 0 && snapshot.completedLessons < snapshot.totalLessons) {
      statusLabel = "in-progress";
    }
    if (snapshot.completedLessons === snapshot.totalLessons && snapshot.totalLessons > 0) {
      statusLabel = milestoneStatus?.allPassed ? "ready" : "review-needed";
    }

    return {
      phaseId: phase.id,
      title: phase.title,
      completedLessons: snapshot.completedLessons,
      totalLessons: snapshot.totalLessons,
      transferEvidence: snapshot.transferEvidence,
      transferLessons: snapshot.transferLessons,
      reinforcementPendingCount,
      readyToAdvance: milestoneStatus?.allPassed ?? false,
      statusLabel,
    };
  });
}