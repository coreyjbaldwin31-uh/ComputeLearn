type LessonEntryCueProps = {
  message: string;
  onDismiss: () => void;
};

export function LessonEntryCue({ message, onDismiss }: LessonEntryCueProps) {
  return (
    <div className="lesson-entry-cue" role="status" aria-live="polite">
      <div className="lesson-entry-cue-message">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M4.2 7.2 6 9l3.8-3.8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{message}</span>
      </div>
      <button
        type="button"
        className="lesson-entry-cue-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss lesson entry cue"
      >
        Dismiss
      </button>
    </div>
  );
}
