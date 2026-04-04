"use client";

import { useState } from "react";

type ProgressRoadmapProps = {
  phases: {
    id: string;
    title: string;
    level: string;
    duration: string;
    courses: {
      id: string;
      title: string;
      lessons: { id: string; title: string; duration: string }[];
    }[];
  }[];
  selectedPhaseId: string;
  progress: Record<string, true>;
  phaseLessonCounts: { total: number; completed: number }[];
  onSelectPhase: (phaseId: string) => void;
};

export function ProgressRoadmap({
  phases,
  selectedPhaseId,
  progress,
  phaseLessonCounts,
  onSelectPhase,
}: ProgressRoadmapProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  return (
    <nav className="progress-roadmap" aria-label="Curriculum progress">
      <ol className="roadmap-track">
        {phases.map((phase, i) => {
          const counts = phaseLessonCounts[i];
          const pct =
            counts && counts.total > 0
              ? Math.round((counts.completed / counts.total) * 100)
              : 0;
          const isActive = phase.id === selectedPhaseId;
          const isDone = pct === 100;
          const previousCounts = phaseLessonCounts[i - 1];
          const isUpcoming =
            i > 0 &&
            pct === 0 &&
            previousCounts != null &&
            previousCounts.total > 0 &&
            previousCounts.completed < previousCounts.total;
          const isExpanded = expandedPhase === phase.id;

          return (
            <li key={phase.id} className="roadmap-step">
              <button
                type="button"
                className={`roadmap-node ${isActive ? "roadmap-node--active" : ""} ${isDone ? "roadmap-node--done" : ""} ${isUpcoming ? "roadmap-node--upcoming" : ""}`}
                onClick={() => onSelectPhase(phase.id)}
                aria-current={isActive ? "step" : undefined}
                title={`${phase.title} — ${pct}% complete${isUpcoming ? " (upcoming)" : ""}`}
              >
                <span className="roadmap-dot">
                  {isDone ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="roadmap-check-icon"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : pct > 0 ? (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      aria-hidden="true"
                      className="roadmap-ring"
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="9"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="11"
                        cy="11"
                        r="9"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={`${(pct / 100) * 56.55} 56.55`}
                        transform="rotate(-90 11 11)"
                      />
                    </svg>
                  ) : null}
                </span>
                <span className="roadmap-label">{phase.level}</span>
                <span className="roadmap-pct">{pct}%</span>
                <span className="roadmap-est">{phase.duration}</span>
              </button>
              <button
                type="button"
                className="roadmap-expand"
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${phase.title} lessons`}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className={isExpanded ? "roadmap-chevron--open" : ""}
                >
                  <path
                    d="M3 4.5l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {isExpanded && (
                <ul className="roadmap-lessons">
                  {phase.courses.flatMap((course) =>
                    course.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className={`roadmap-lesson ${progress[lesson.id] ? "roadmap-lesson--done" : ""}`}
                      >
                        <span className="roadmap-lesson-dot" />
                        <span className="roadmap-lesson-title">
                          {lesson.title}
                        </span>
                        <span className="roadmap-lesson-time">
                          {lesson.duration}
                        </span>
                      </li>
                    )),
                  )}
                </ul>
              )}
              {i < phases.length - 1 && (
                <span
                  className={`roadmap-connector ${isDone ? "roadmap-connector--done" : pct > 0 ? "roadmap-connector--partial" : ""}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
