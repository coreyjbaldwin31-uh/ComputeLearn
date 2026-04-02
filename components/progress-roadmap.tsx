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
          const isLocked =
            i > 0 &&
            phaseLessonCounts[i - 1] &&
            phaseLessonCounts[i - 1].total > 0 &&
            phaseLessonCounts[i - 1].completed === 0 &&
            counts &&
            counts.completed === 0;
          const isExpanded = expandedPhase === phase.id;

          return (
            <li key={phase.id} className="roadmap-step">
              <button
                type="button"
                className={`roadmap-node ${isActive ? "roadmap-node--active" : ""} ${isDone ? "roadmap-node--done" : ""} ${isLocked ? "roadmap-node--locked" : ""}`}
                onClick={() => {
                  if (!isLocked) onSelectPhase(phase.id);
                }}
                aria-current={isActive ? "step" : undefined}
                title={`${phase.title} — ${pct}% complete${isLocked ? " (locked)" : ""}`}
                disabled={isLocked}
              >
                <span className="roadmap-dot">
                  {isLocked && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      aria-hidden="true"
                      className="roadmap-lock-icon"
                    >
                      <rect
                        x="2"
                        y="5"
                        width="6"
                        height="4"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1"
                        fill="none"
                      />
                      <path
                        d="M3.5 5V3.5a1.5 1.5 0 013 0V5"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="roadmap-label">{phase.level}</span>
                <span className="roadmap-pct">{pct}%</span>
                <span className="roadmap-est">{phase.duration}</span>
              </button>
              {!isLocked && (
                <button
                  type="button"
                  className="roadmap-expand"
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  aria-expanded={isExpanded}
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
              )}
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
              {i < phases.length - 1 && <span className="roadmap-connector" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
