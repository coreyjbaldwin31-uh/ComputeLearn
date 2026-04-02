"use client";

import type { Curriculum, Phase } from "@/data/curriculum";
import type { LessonEntry, ReviewRecord } from "@/lib/progression-engine";

type PhaseSummary = {
  phase: Phase;
  total: number;
  completed: number;
  pct: number;
};

type HomeDashboardProps = {
  curriculum: Curriculum;
  percentComplete: number;
  activityStreak: number;
  progress: Record<string, true>;
  reviews: Record<string, ReviewRecord>;
  allLessonsFlat: LessonEntry[];
  nextUnfinishedEntry: LessonEntry | undefined;
  reviewQueueCount: number;
  phaseLessonCounts: { total: number; completed: number }[];
  onContinueCourse: () => void;
  onSelectPhase: (phaseId: string) => void;
  onNavigateToEntry: (entry: LessonEntry) => void;
};

function PhaseIcon({ done, locked }: { done: boolean; locked: boolean }) {
  if (done) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="10" fill="var(--accent)" />
        <path
          d="M6 10.5l2.5 2.5 5.5-5.5"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (locked) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="5"
          y="9"
          width="10"
          height="8"
          rx="2"
          stroke="var(--muted)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M7.5 9V6.5a2.5 2.5 0 015 0V9"
          stroke="var(--muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="9"
        stroke="var(--accent)"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M8 7l5 3-5 3V7z" fill="var(--accent)" />
    </svg>
  );
}

function getPhaseStatus(
  index: number,
  summaries: PhaseSummary[],
): "done" | "active" | "locked" {
  if (summaries[index].pct === 100) return "done";
  if (index === 0) return "active";
  if (summaries[index - 1].pct === 100) return "active";
  if (summaries[index].completed > 0) return "active";
  return "locked";
}

export function HomeDashboard({
  curriculum,
  percentComplete,
  activityStreak,
  progress,
  reviews,
  allLessonsFlat,
  nextUnfinishedEntry,
  reviewQueueCount,
  phaseLessonCounts,
  onContinueCourse,
  onSelectPhase,
  onNavigateToEntry,
}: HomeDashboardProps) {
  const phaseSummaries: PhaseSummary[] = curriculum.phases.map((phase, i) => ({
    phase,
    total: phaseLessonCounts[i]?.total ?? 0,
    completed: phaseLessonCounts[i]?.completed ?? 0,
    pct:
      phaseLessonCounts[i] && phaseLessonCounts[i].total > 0
        ? Math.round(
            (phaseLessonCounts[i].completed / phaseLessonCounts[i].total) * 100,
          )
        : 0,
  }));

  const currentPhase =
    phaseSummaries.find((s) => s.pct < 100) ??
    phaseSummaries[phaseSummaries.length - 1];

  const recentlyCompleted = allLessonsFlat
    .filter((e) => {
      const r = reviews[e.lesson.id];
      return r?.completedAt != null;
    })
    .sort((a, b) => {
      const da = reviews[a.lesson.id]?.completedAt ?? "";
      const db = reviews[b.lesson.id]?.completedAt ?? "";
      return db.localeCompare(da);
    })
    .slice(0, 3);

  return (
    <section className="home-dashboard">
      {/* ── Progress summary ──────────────────────────────── */}
      <div className="dashboard-progress-card">
        <div className="dashboard-progress-header">
          <div>
            <h2 className="dashboard-title">Your learning journey</h2>
            <p className="dashboard-subtitle">
              {percentComplete === 0
                ? "Ready to begin? Start your first lesson below."
                : percentComplete === 100
                  ? "Congratulations — curriculum complete!"
                  : `${percentComplete}% complete · Phase ${
                      currentPhase
                        ? curriculum.phases.indexOf(currentPhase.phase) + 1
                        : 1
                    } of ${curriculum.phases.length}`}
            </p>
          </div>
          {activityStreak > 0 && (
            <div className="dashboard-streak">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 1c0 4-3 5-3 8a3 3 0 006 0c0-3-3-4-3-8z"
                  fill="var(--gold)"
                />
              </svg>
              <span className="dashboard-streak-value">
                {activityStreak}d streak
              </span>
            </div>
          )}
        </div>

        <div className="dashboard-progress-bar-wrap">
          <div className="dashboard-progress-track">
            <div
              className="dashboard-progress-fill"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <span className="dashboard-progress-pct">{percentComplete}%</span>
        </div>

        {nextUnfinishedEntry && (
          <div className="dashboard-next-action">
            <span className="dashboard-next-label">Up next</span>
            <span className="dashboard-next-lesson">
              {nextUnfinishedEntry.lesson.title}
            </span>
            <span className="dashboard-next-meta">
              {nextUnfinishedEntry.lesson.duration} ·{" "}
              {nextUnfinishedEntry.lesson.difficulty}
            </span>
          </div>
        )}

        <button
          type="button"
          className="dashboard-cta"
          onClick={onContinueCourse}
        >
          {percentComplete === 0
            ? "Start course"
            : percentComplete === 100
              ? "Review lessons"
              : "Continue course"}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ── Notifications ─────────────────────────────────── */}
      {(reviewQueueCount > 0 || recentlyCompleted.length > 0) && (
        <div className="dashboard-notifications">
          <h3 className="dashboard-section-title">Notifications</h3>
          <ul className="dashboard-notif-list">
            {reviewQueueCount > 0 && (
              <li className="dashboard-notif dashboard-notif--review">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="var(--gold)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M8 4v4l2.5 1.5"
                    stroke="var(--gold)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>
                  {reviewQueueCount} lesson{reviewQueueCount !== 1 ? "s" : ""}{" "}
                  due for review
                </span>
              </li>
            )}
            {recentlyCompleted.map((entry) => (
              <li
                key={entry.lesson.id}
                className="dashboard-notif dashboard-notif--complete"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M5 8.5l2 2 4-4"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <button
                  type="button"
                  className="dashboard-notif-link"
                  onClick={() => onNavigateToEntry(entry)}
                >
                  Completed: {entry.lesson.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Phase map ─────────────────────────────────────── */}
      <div className="dashboard-phase-map">
        <h3 className="dashboard-section-title">Course roadmap</h3>
        <div className="dashboard-phases">
          {phaseSummaries.map((s, i) => {
            const status = getPhaseStatus(i, phaseSummaries);
            const nextLessonInPhase = allLessonsFlat.find(
              (e) => e.phase.id === s.phase.id && !progress[e.lesson.id],
            );

            return (
              <button
                key={s.phase.id}
                type="button"
                className={`dashboard-phase-card dashboard-phase-card--${status}`}
                onClick={() =>
                  status !== "locked" ? onSelectPhase(s.phase.id) : undefined
                }
                disabled={status === "locked"}
              >
                <div className="dashboard-phase-top">
                  <PhaseIcon
                    done={status === "done"}
                    locked={status === "locked"}
                  />
                  <span className="dashboard-phase-level">{s.phase.level}</span>
                </div>
                <h4 className="dashboard-phase-title">{s.phase.title}</h4>
                <p className="dashboard-phase-desc">{s.phase.strapline}</p>
                <div className="dashboard-phase-meta">
                  <span>{s.phase.duration}</span>
                  <span>
                    {s.completed}/{s.total} lessons
                  </span>
                </div>
                <div className="dashboard-phase-bar-wrap">
                  <div className="dashboard-phase-bar">
                    <div
                      className="dashboard-phase-bar-fill"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <span className="dashboard-phase-pct">{s.pct}%</span>
                </div>
                {status === "active" && nextLessonInPhase && (
                  <span className="dashboard-phase-next">
                    Next: {nextLessonInPhase.lesson.title}
                  </span>
                )}
                {status === "locked" && (
                  <span className="dashboard-phase-locked-label">
                    Complete previous phase to unlock
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
