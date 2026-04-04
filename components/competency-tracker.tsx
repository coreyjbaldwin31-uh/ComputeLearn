"use client";

import type { AttemptRecord } from "@/lib/artifact-engine";
import type { LabInstance } from "@/lib/lab-engine";
import { curriculum } from "@/data/curriculum";
import { useLocalStorageState } from "./hooks/use-local-storage-state";
import {
  calculateCompetencyLevels,
  calculatePercentComplete,
  evaluatePhaseExitStatus,
  flattenLessonEntries,
  getPhaseProgressSnapshot,
  formatTrackName,
} from "@/lib/progression-engine";
import { useCallback, useMemo } from "react";

type ProgressState = Record<string, true>;
type TransferState = Record<string, true>;

export function CompetencyTracker() {
  const [progress] = useLocalStorageState<ProgressState>(
    "computelearn-progress",
    {},
  );
  const [transferProgress] = useLocalStorageState<TransferState>(
    "computelearn-transfer",
    {},
  );
  const [attempts] = useLocalStorageState<AttemptRecord[]>(
    "computelearn-attempts",
    [],
  );
  const [labInstances] = useLocalStorageState<Record<string, LabInstance>>(
    "computelearn-lab-instances",
    {},
  );

  const allLessons = useMemo(() => flattenLessonEntries(curriculum), []);

  const completedCount = useMemo(
    () => allLessons.filter((e) => progress[e.lesson.id]).length,
    [allLessons, progress],
  );

  const percent = useMemo(
    () => calculatePercentComplete(curriculum, progress),
    [progress],
  );

  const competencyLevels = useMemo(
    () => calculateCompetencyLevels(curriculum, progress),
    [progress],
  );

  const phaseSnapshots = useMemo(
    () =>
      curriculum.phases.map((phase) => {
        const snapshot = getPhaseProgressSnapshot(
          phase,
          progress,
          transferProgress,
        );
        return {
          phase,
          snapshot,
          exit: evaluatePhaseExitStatus(
            curriculum,
            phase.id,
            competencyLevels,
            snapshot.transferEvidence,
            snapshot.transferLessons,
          ),
        };
      }),
    [progress, transferProgress, competencyLevels],
  );

  const attemptsByType = useMemo(() => {
    const action = attempts.filter((a) => a.assessmentType === "action").length;
    const reasoning = attempts.filter(
      (a) => a.assessmentType === "reasoning",
    ).length;
    const debugging = attempts.filter(
      (a) => a.assessmentType === "debugging",
    ).length;
    const transfer = attempts.filter(
      (a) => a.assessmentType === "transfer",
    ).length;
    return { action, reasoning, debugging, transfer, total: attempts.length };
  }, [attempts]);

  const labCompleted = useMemo(
    () =>
      Object.values(labInstances).filter((l) => l.status === "completed")
        .length,
    [labInstances],
  );

  const transferCount = useMemo(
    () => Object.keys(transferProgress).length,
    [transferProgress],
  );

  return (
    <div className="ct">
      {/* Overall progress */}
      <div className="ct-overview">
        <div className="ct-progress-bar-wrap">
          <div className="ct-progress-bar">
            <div
              className="ct-progress-fill"
              ref={useCallback(
                (el: HTMLDivElement | null) => {
                  if (el) el.style.width = `${percent}%`;
                },
                [percent],
              )}
            />
          </div>
          <span className="ct-progress-pct">{percent}%</span>
        </div>
        <div className="ct-overview-stats">
          <span>
            {completedCount}/{allLessons.length} lessons
          </span>
          <span>{labCompleted} labs completed</span>
          <span>{transferCount} transfers passed</span>
          <span>{attemptsByType.total} total attempts</span>
        </div>
      </div>

      {/* Assessment breakdown */}
      <div className="ct-section">
        <h3 className="ct-section-title">Assessment activity</h3>
        <div className="ct-assessment-grid">
          {(
            [
              ["Action", attemptsByType.action],
              ["Reasoning", attemptsByType.reasoning],
              ["Debugging", attemptsByType.debugging],
              ["Transfer", attemptsByType.transfer],
            ] as const
          ).map(([label, count]) => (
            <div key={label} className="ct-assessment-item">
              <span className="ct-assessment-value">{count}</span>
              <span className="ct-assessment-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Competency levels */}
      <div className="ct-section">
        <h3 className="ct-section-title">Competency levels</h3>
        <div className="ct-comp-grid">
          {Object.entries(competencyLevels).map(([track, score]) => (
            <div key={track} className="ct-comp-row">
              <span className="ct-comp-track">{formatTrackName(track)}</span>
              <div className="ct-comp-bar-wrap">
                <div className="ct-comp-bar">
                  <div
                    className="ct-comp-bar-fill"
                    ref={(el) => {
                      if (el) el.style.width = `${Math.min(score * 10, 100)}%`;
                    }}
                  />
                </div>
                <span className="ct-comp-score">{score}</span>
              </div>
            </div>
          ))}
          {Object.keys(competencyLevels).length === 0 && (
            <p className="ct-empty">
              Complete lessons to build competency evidence.
            </p>
          )}
        </div>
      </div>

      {/* Phase progress */}
      <div className="ct-section">
        <h3 className="ct-section-title">Phase progress</h3>
        {phaseSnapshots.map(({ phase, snapshot, exit }) => (
          <div key={phase.id} className="ct-phase-block">
            <div className="ct-phase-head">
              <span className="ct-phase-title">{phase.title}</span>
              <span
                className={`ct-gate-badge${exit?.allPassed ? " ct-gate-badge--pass" : ""}`}
              >
                {exit?.allPassed ? "Gate passed" : "In progress"}
              </span>
            </div>
            <div className="ct-phase-bar-wrap">
              <div className="ct-phase-bar">
                <div
                  className="ct-phase-fill"
                  ref={(el) => {
                    if (el)
                      el.style.width = `${
                        snapshot.totalLessons > 0
                          ? Math.round(
                              (snapshot.completedLessons /
                                snapshot.totalLessons) *
                                100,
                            )
                          : 0
                      }%`;
                  }}
                />
              </div>
              <span className="ct-phase-frac">
                {snapshot.completedLessons}/{snapshot.totalLessons}
              </span>
            </div>
            <div className="ct-phase-meta">
              <span>{phase.level}</span>
              <span>{phase.duration}</span>
              <span>
                {snapshot.transferEvidence}/{snapshot.transferLessons} transfers
              </span>
            </div>

            {/* Exit gates */}
            {exit && exit.gates.length > 0 && (
              <div className="ct-gates">
                {exit.gates.map((gate) => (
                  <div key={gate.description} className="ct-gate-row">
                    <span
                      className={`ct-gate-dot${gate.passed ? " ct-gate-dot--pass" : ""}`}
                    />
                    <span className="ct-gate-desc">{gate.description}</span>
                    <span className="ct-gate-req">
                      {gate.competency} ≥ {gate.requiredLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
