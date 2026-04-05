"use client";

import type { LessonEntry } from "@/lib/progression-engine";
import styles from "./lesson-navigation.module.css";

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
    <nav className={styles.lessonNav}>
      {prevEntry ? (
        <button
          type="button"
          className={`${styles.lessonNavButton} ${styles.lessonNavPrev}`}
          onClick={() => onNavigateToEntry(prevEntry)}
          aria-label={`Previous lesson: ${prevEntry.lesson.title} (k)`}
        >
          <span className={styles.lessonNavArrow} aria-hidden="true">
            ←
          </span>
          <span className={styles.lessonNavLabel}>
            <span className={styles.lessonNavKicker}>Previous lesson</span>
            <span className={styles.lessonNavTitle}>{prevEntry.lesson.title}</span>
          </span>
        </button>
      ) : (
        <span className={styles.navSpacer} />
      )}
      {nextEntry ? (
        <button
          type="button"
          className={`${styles.lessonNavButton} ${styles.lessonNavNext}`}
          onClick={() => onNavigateToEntry(nextEntry)}
          aria-label={`Next lesson: ${nextEntry.lesson.title} (j)`}
        >
          <span className={`${styles.lessonNavLabel} ${styles.right}`}>
            <span className={styles.lessonNavKicker}>Next lesson</span>
            <span className={styles.lessonNavTitle}>{nextEntry.lesson.title}</span>
          </span>
          <span className={styles.lessonNavArrow} aria-hidden="true">
            →
          </span>
        </button>
      ) : (
        <span className={styles.navSpacer} />
      )}
    </nav>
  );
}
