import type { Lesson } from "@/data/curriculum";

type ActionBarProps = {
  lesson: Lesson;
  isComplete: boolean;
  onToggleCompletion: () => void;
  onScrollToNotes: () => void;
  onScrollToExercises: () => void;
};

export function ActionBar({
  lesson,
  isComplete,
  onToggleCompletion,
  onScrollToNotes,
  onScrollToExercises,
}: ActionBarProps) {
  return (
    <div className="action-bar" role="toolbar" aria-label="Lesson actions">
      <div className="action-bar-left">
        <span className="action-bar-time">
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
        <span className="action-bar-diff">{lesson.difficulty}</span>
      </div>

      <div className="action-bar-right">
        <button
          type="button"
          className="action-bar-btn"
          onClick={onScrollToExercises}
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
          className="action-bar-btn"
          onClick={onScrollToNotes}
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

        <button
          type="button"
          className={`action-bar-complete ${isComplete ? "action-bar-complete--done" : ""}`}
          onClick={onToggleCompletion}
        >
          {isComplete ? (
            <>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </button>
      </div>
    </div>
  );
}
