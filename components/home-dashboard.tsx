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

  const totalCompleted = phaseLessonCounts.reduce((s, c) => s + c.completed, 0);
  const totalLessons = phaseLessonCounts.reduce((s, c) => s + c.total, 0);

  return (
    <section className="home-dashboard">
      {/* ── Two-column hero: progress + continue card ──────────── */}
      <div className="dashboard-hero-row">
        <div className="dashboard-progress-card">
          <div className="dashboard-progress-header">
            <div>
              <h2 className="dashboard-title">Your progress</h2>
              <p className="dashboard-subtitle">
                {percentComplete === 0
                  ? "Ready to begin? Start your first lesson below."
                  : percentComplete === 100
                    ? "Congratulations — curriculum complete!"
                    : `${totalCompleted} of ${totalLessons} lessons · Phase ${
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

          {/* Mini stats row */}
          <div className="dashboard-mini-stats">
            <div className="dashboard-mini-stat">
              <span className="dashboard-mini-stat-value">
                {totalCompleted}
              </span>
              <span className="dashboard-mini-stat-label">completed</span>
            </div>
            <div className="dashboard-mini-stat">
              <span className="dashboard-mini-stat-value">
                {totalLessons - totalCompleted}
              </span>
              <span className="dashboard-mini-stat-label">remaining</span>
            </div>
            <div className="dashboard-mini-stat">
              <span className="dashboard-mini-stat-value">
                {phaseSummaries.filter((s) => s.pct === 100).length}
              </span>
              <span className="dashboard-mini-stat-label">phases cleared</span>
            </div>
          </div>
        </div>

        {/* Continue card — primary action (Coursera pattern) */}
        {nextUnfinishedEntry && (
          <div className="dashboard-continue-card">
            <div className="dashboard-continue-phase">
              {currentPhase?.phase.title ?? "Current phase"}
            </div>
            <h3 className="dashboard-continue-title">
              {nextUnfinishedEntry.lesson.title}
            </h3>
            <p className="dashboard-continue-meta">
              {nextUnfinishedEntry.lesson.duration} ·{" "}
              {nextUnfinishedEntry.lesson.difficulty}
            </p>
            <p className="dashboard-continue-summary">
              {nextUnfinishedEntry.lesson.summary}
            </p>
            <button
              type="button"
              className="dashboard-cta"
              onClick={onContinueCourse}
            >
              {percentComplete === 0 ? "Start lesson" : "Continue lesson"}
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
        )}
      </div>

      {/* ── Activity feed ─────────────────────────────────── */}
      {(reviewQueueCount > 0 || recentlyCompleted.length > 0) && (
        <div className="dashboard-activity">
          <h3 className="dashboard-section-title">
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
                stroke="currentColor"
                strokeWidth="1.3"
                fill="none"
              />
              <path
                d="M8 4v4l2.5 1.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            Recent activity
          </h3>
          <div className="dashboard-activity-items">
            {reviewQueueCount > 0 && (
              <div className="dashboard-activity-item dashboard-activity-item--review">
                <div className="dashboard-activity-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="9"
                      cy="9"
                      r="7.5"
                      stroke="var(--gold)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M9 5v4l2.5 1.5"
                      stroke="var(--gold)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="dashboard-activity-text">
                  <strong>
                    {reviewQueueCount} lesson
                    {reviewQueueCount !== 1 ? "s" : ""} due for review
                  </strong>
                  <span>Reinforce your learning with spaced repetition</span>
                </div>
              </div>
            )}
            {recentlyCompleted.map((entry) => (
              <button
                key={entry.lesson.id}
                type="button"
                className="dashboard-activity-item dashboard-activity-item--complete"
                onClick={() => onNavigateToEntry(entry)}
              >
                <div className="dashboard-activity-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="9" cy="9" r="8" fill="var(--accent)" />
                    <path
                      d="M6 9.5l2 2 4-4"
                      stroke="#fff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="dashboard-activity-text">
                  <strong>{entry.lesson.title}</strong>
                  <span>
                    {entry.phase.title} · {entry.course.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Phase map — curriculum outline ──────────────── */}
      <div className="dashboard-phase-map">
        <h3 className="dashboard-section-title">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 3h12M2 8h12M2 13h8"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          Course outline
        </h3>
        <div className="dashboard-phases">
          {phaseSummaries.map((s, i) => {
            const status = getPhaseStatus(i, phaseSummaries);
            const nextLessonInPhase = allLessonsFlat.find(
              (e) => e.phase.id === s.phase.id && !progress[e.lesson.id],
            );
            const phaseNum = i + 1;

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
                  <span
                    className={`dashboard-phase-num dashboard-phase-num--${status}`}
                  >
                    {status === "done" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 8.5l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : status === "locked" ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect
                          x="3"
                          y="6.5"
                          width="8"
                          height="5.5"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          fill="none"
                        />
                        <path
                          d="M5 6.5V5a2 2 0 014 0v1.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      phaseNum
                    )}
                  </span>
                  <div className="dashboard-phase-title-wrap">
                    <h4 className="dashboard-phase-title">{s.phase.title}</h4>
                    <span className="dashboard-phase-level">
                      {s.phase.level}
                    </span>
                  </div>
                </div>
                <p className="dashboard-phase-desc">{s.phase.strapline}</p>
                <div className="dashboard-phase-bar-wrap">
                  <div className="dashboard-phase-bar">
                    <div
                      className="dashboard-phase-bar-fill"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <span className="dashboard-phase-pct">
                    {s.completed}/{s.total}
                  </span>
                </div>
                <div className="dashboard-phase-footer">
                  <span className="dashboard-phase-time">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="6"
                        cy="6"
                        r="5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        fill="none"
                      />
                      <path
                        d="M6 3v3l2 1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {s.phase.duration}
                  </span>
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
                  {status === "done" && (
                    <span className="dashboard-phase-done-label">
                      Completed
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
