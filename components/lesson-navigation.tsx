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
          className="lesson-nav-button"
          onClick={() => onNavigateToEntry(prevEntry)}
        >
          <span>←</span>
          <span className="lesson-nav-label">
            <span className="lesson-nav-kicker">Previous</span>
            <span className="lesson-nav-title">{prevEntry.lesson.title}</span>
          </span>
        </button>
      ) : (
        <span className="nav-spacer" />
      )}
      {nextEntry ? (
        <button
          type="button"
          className="lesson-nav-button"
          onClick={() => onNavigateToEntry(nextEntry)}
        >
          <span className="lesson-nav-label right">
            <span className="lesson-nav-kicker">Next</span>
            <span className="lesson-nav-title">{nextEntry.lesson.title}</span>
          </span>
          <span>→</span>
        </button>
      ) : (
        <span className="nav-spacer" />
      )}
    </nav>
  );
}
