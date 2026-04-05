import type { Lesson } from "@/data/curriculum";
import styles from "./action-bar.module.css";

type ActionBarProps = {
  lesson: Lesson;
  isComplete: boolean;
  lessonProgress: { current: number; total: number };
  onToggleCompletion: () => void;
  onScrollToNotes: () => void;
  onScrollToExercises: () => void;
};

function difficultyClass(difficulty: string) {
  const value = difficulty.toLowerCase();
  if (value === "beginner") return styles.diffBeginner;
  if (value === "intermediate") return styles.diffIntermediate;
  if (value === "advanced") return styles.diffAdvanced;
  return "";
}

export function ActionBar({
  lesson,
  isComplete,
  lessonProgress,
  onToggleCompletion,
  onScrollToNotes,
  onScrollToExercises,
}: ActionBarProps) {
  const progressPct =
    lessonProgress.total > 0
      ? Math.round((lessonProgress.current / lessonProgress.total) * 100)
      : 0;

  return (
    <div className={styles.bar} role="toolbar" aria-label="Lesson actions">
      <div className={styles.left}>
        <span className={styles.time}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="7"
              cy="7"
              r="6"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M7 3.5V7l2.5 1.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {lesson.duration}
        </span>
        <span
          className={`${styles.diff} ${difficultyClass(lesson.difficulty)}`}
        >
          {lesson.difficulty}
        </span>
        {lessonProgress.total > 0 && (
          <span className={styles.progress}>
            <progress
              className={styles.progressTrack}
              value={progressPct}
              max={100}
              aria-label="Lesson exercise completion"
            />
            <span className={styles.progressLabel}>
              {lessonProgress.current}/{lessonProgress.total}
            </span>
          </span>
        )}
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.button}
          onClick={onScrollToExercises}
          aria-label="Jump to exercises section"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="2"
              width="12"
              height="10"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.3"
              fill="none"
            />
            <path
              d="M4 5.5h6M4 8.5h4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          Exercises
        </button>

        <button
          type="button"
          className={styles.button}
          onClick={onScrollToNotes}
          aria-label="Jump to notes section"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 2h7l3 3v7H2V2z"
              stroke="currentColor"
              strokeWidth="1.3"
              fill="none"
            />
            <path
              d="M9 2v3h3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M4.5 7h5M4.5 9.5h3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          Notes
        </button>

        {isComplete ? (
          <button
            type="button"
            className={`${styles.complete} ${styles.completeDone}`}
            onClick={onToggleCompletion}
            aria-pressed="true"
            aria-label="Mark lesson as incomplete"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="6" fill="var(--accent)" />
              <path
                d="M4.5 7.5l2 2 3.5-3.5"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Completed
          </button>
        ) : (
          <button
            type="button"
            className={styles.complete}
            onClick={onToggleCompletion}
            aria-pressed="false"
            aria-label="Mark lesson as complete"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="7"
                cy="7"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
            Mark complete
          </button>
        )}
      </div>
    </div>
  );
}
