"use client";

import Link from "next/link";
import type { Lesson } from "@/data/curriculum";

type LessonReviewPanelProps = {
  previousLessons: Lesson[];
  progress: Record<string, true>;
  weakTracks: string[];
};

export function LessonReviewPanel({
  previousLessons,
  progress,
  weakTracks,
}: LessonReviewPanelProps) {
  const incompletePrevious = previousLessons.filter((l) => !progress[l.id]);
  const hasWeakOverlap = previousLessons.some((l) =>
    l.competencies?.some((c) => weakTracks.includes(c.track)),
  );

  if (incompletePrevious.length === 0 && !hasWeakOverlap) {
    return null;
  }

  return (
    <div className="rp">
      <div className="rp-header">
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="rp-icon"
        >
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M8 4v4l2.5 1.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        <h3 className="rp-title">
          {incompletePrevious.length > 0
            ? "Before you start — review previous lessons"
            : "Strengthen your foundation"}
        </h3>
      </div>

      {incompletePrevious.length > 0 && (
        <p className="rp-desc">
          These earlier lessons build up to this one. Consider reviewing them if
          you are not confident in the material.
        </p>
      )}

      {hasWeakOverlap && incompletePrevious.length === 0 && (
        <p className="rp-desc">
          Some competencies in this lesson overlap with areas where you could
          use more practice. Revisiting these lessons may help.
        </p>
      )}

      <div className="rp-cards">
        {previousLessons.map((prevLesson) => {
          const isComplete = !!progress[prevLesson.id];
          const hasWeakness = prevLesson.competencies?.some((c) =>
            weakTracks.includes(c.track),
          );

          return (
            <Link
              key={prevLesson.id}
              href={`/lessons/${prevLesson.id}`}
              className={`rp-card${!isComplete ? " rp-card--incomplete" : ""}${hasWeakness ? " rp-card--weak" : ""}`}
            >
              <div className="rp-card-status">
                {isComplete ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-label="Completed"
                  >
                    <path
                      d="M3 8.5l3.5 3L13 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="rp-card-dot" />
                )}
              </div>
              <div className="rp-card-content">
                <span className="rp-card-title">{prevLesson.title}</span>
                <span className="rp-card-summary">{prevLesson.summary}</span>
                {hasWeakness && (
                  <span className="rp-card-weak-badge">
                    Overlapping skill area
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
