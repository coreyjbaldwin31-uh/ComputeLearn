"use client";

import type { LessonEntry } from "@/lib/progression-engine";

type LessonNavigationProps = {
  prevEntry: LessonEntry | null;
  nextEntry: LessonEntry | null;
  onNavigateToEntry: (entry: LessonEntry) => void;
};

export function LessonNavigation({
  prevEntry,
  nextEntry,
  onNavigateToEntry,
}: LessonNavigationProps) {
  return (
    <nav className="lesson-nav">
      {prevEntry ? (
        <button
          type="button"
          className="lesson-nav-button lesson-nav-prev"
          onClick={() => onNavigateToEntry(prevEntry)}
        >
          <span className="lesson-nav-arrow" aria-hidden="true">←</span>
          <span className="lesson-nav-label">
            <span className="lesson-nav-kicker">Previous lesson</span>
            <span className="lesson-nav-title">{prevEntry.lesson.title}</span>
          </span>
        </button>
      ) : (
        <span className="nav-spacer" />
      )}
      {nextEntry ? (
        <button
          type="button"
          className="lesson-nav-button lesson-nav-next"
          onClick={() => onNavigateToEntry(nextEntry)}
        >
          <span className="lesson-nav-label right">
            <span className="lesson-nav-kicker">Next lesson</span>
            <span className="lesson-nav-title">{nextEntry.lesson.title}</span>
          </span>
          <span className="lesson-nav-arrow" aria-hidden="true">→</span>
        </button>
      ) : (
        <span className="nav-spacer" />
      )}
    </nav>
  );
}
