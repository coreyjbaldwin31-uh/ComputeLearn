"use client";

import Link from "next/link";
import type { ReviewRecord } from "@/lib/progression-engine";
import type { AttemptRecord, ArtifactRecord } from "@/lib/artifact-engine";
import type { LabInstance } from "@/lib/lab-engine";
import { curriculum } from "@/data/curriculum";
import { useLocalStorageState } from "./hooks/use-local-storage-state";
import {
  calculateActivityStreak,
  calculatePercentComplete,
  flattenLessonEntries,
  getDueReviewQueue,
  getPhaseProgressSnapshot,
} from "@/lib/progression-engine";
import { useMemo } from "react";

type ProgressState = Record<string, true>;
type TransferState = Record<string, true>;

export function LearnerDashboard() {
  const [progress] = useLocalStorageState<ProgressState>(
    "computelearn-progress",
    {},
  );
  const [transferProgress] = useLocalStorageState<TransferState>(
    "computelearn-transfer",
    {},
  );
  const [reviews] = useLocalStorageState<Record<string, ReviewRecord>>(
    "computelearn-reviews",
    {},
  );
  const [attempts] = useLocalStorageState<AttemptRecord[]>(
    "computelearn-attempts",
    [],
  );
  const [artifacts] = useLocalStorageState<ArtifactRecord[]>(
    "computelearn-artifacts",
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

  const streak = useMemo(() => calculateActivityStreak(reviews), [reviews]);

  const dueReviews = useMemo(
    () => getDueReviewQueue(allLessons, reviews),
    [allLessons, reviews],
  );

  const labsCompleted = useMemo(
    () =>
      Object.values(labInstances).filter((l) => l.status === "completed")
        .length,
    [labInstances],
  );

  const nextLesson = useMemo(() => {
    for (const entry of allLessons) {
      if (!progress[entry.lesson.id]) return entry;
    }
    return null;
  }, [allLessons, progress]);

  const phaseSnapshots = useMemo(
    () =>
      curriculum.phases.map((phase) => ({
        phase,
        snapshot: getPhaseProgressSnapshot(phase, progress, transferProgress),
      })),
    [progress, transferProgress],
  );

  return (
    <div className="ld">
      {/* Stat strip */}
      <div className="ld-stats">
        <div className="ld-stat">
          <span className="ld-stat-value">{percent}%</span>
          <span className="ld-stat-label">Complete</span>
        </div>
        <div className="ld-stat">
          <span className="ld-stat-value">
            {completedCount}/{allLessons.length}
          </span>
          <span className="ld-stat-label">Lessons</span>
        </div>
        <div className="ld-stat">
          <span className="ld-stat-value">{streak}</span>
          <span className="ld-stat-label">Day streak</span>
        </div>
        <div className="ld-stat">
          <span className="ld-stat-value">{labsCompleted}</span>
          <span className="ld-stat-label">Labs done</span>
        </div>
        <div className="ld-stat">
          <span className="ld-stat-value">{attempts.length}</span>
          <span className="ld-stat-label">Attempts</span>
        </div>
        <div className="ld-stat">
          <span className="ld-stat-value">{artifacts.length}</span>
          <span className="ld-stat-label">Artifacts</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="ld-progress-wrap">
        <div className="ld-progress-bar">
          <div className="ld-progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Continue / Due reviews */}
      <div className="ld-action-grid">
        {nextLesson && (
          <div className="ld-action-card">
            <h3>Continue learning</h3>
            <p className="ld-action-meta">
              {nextLesson.phase.title} &middot; {nextLesson.course.title}
            </p>
            <p className="ld-action-title">{nextLesson.lesson.title}</p>
            <Link
              href={`/lessons/${nextLesson.lesson.id}`}
              className="ld-action-link"
            >
              Open lesson &rarr;
            </Link>
          </div>
        )}

        {dueReviews.length > 0 && (
          <div className="ld-action-card ld-action-card--review">
            <h3>Due for review</h3>
            <p className="ld-action-meta">
              {dueReviews.length} lesson{dueReviews.length !== 1 ? "s" : ""}{" "}
              ready to revisit
            </p>
            <ul className="ld-review-list">
              {dueReviews.slice(0, 3).map((entry) => (
                <li key={entry.lesson.id}>
                  <Link href={`/lessons/${entry.lesson.id}`}>
                    {entry.lesson.title}
                  </Link>
                </li>
              ))}
              {dueReviews.length > 3 && (
                <li className="ld-review-more">
                  +{dueReviews.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {!nextLesson && dueReviews.length === 0 && (
          <div className="ld-action-card">
            <h3>All caught up</h3>
            <p className="ld-action-meta">
              No new lessons or pending reviews. Great work.
            </p>
          </div>
        )}
      </div>

      {/* Phase progress */}
      <div className="ld-phases">
        <h3 className="ld-phases-title">Phase progress</h3>
        {phaseSnapshots.map(({ phase, snapshot }, index) => {
          const phasePct =
            snapshot.totalLessons > 0
              ? Math.round(
                  (snapshot.completedLessons / snapshot.totalLessons) * 100,
                )
              : 0;
          return (
            <div key={phase.id} className="ld-phase-row">
              <span className="ld-phase-num">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="ld-phase-info">
                <span className="ld-phase-title">{phase.title}</span>
                <span className="ld-phase-meta">
                  {phase.level} &middot; {phase.duration}
                </span>
              </div>
              <div className="ld-phase-bar-wrap">
                <div className="ld-phase-bar">
                  <div
                    className="ld-phase-fill"
                    style={{ width: `${phasePct}%` }}
                  />
                </div>
                <span className="ld-phase-frac">
                  {snapshot.completedLessons}/{snapshot.totalLessons}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
