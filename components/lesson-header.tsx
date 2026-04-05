"use client";

import type { Course, Lesson, Phase } from "@/data/curriculum";
import { useId } from "react";
import { useFocusTrap } from "./hooks/use-focus-trap";
import styles from "./lesson-header.module.css";

type LessonHeaderProps = {
  selectedPhase: Phase;
  selectedCourse: Course;
  selectedLesson: Lesson;
  progress: Record<string, true>;
  showCompletedOnly: boolean;
  showResetConfirm: boolean;
  lessonGateFeedback: string | null;
  onSelectCourse: (courseId: string) => void;
  onToggleCompletedOnly: () => void;
  onResetLab: () => void;
  onCancelReset: () => void;
  onConfirmReset: () => void;
  showTerminal: boolean;
};

export function LessonHeader({
  selectedPhase,
  selectedCourse,
  selectedLesson,
  progress,
  showCompletedOnly,
  showResetConfirm,
  lessonGateFeedback,
  onSelectCourse,
  onToggleCompletedOnly,
  onResetLab,
  onCancelReset,
  onConfirmReset,
  showTerminal,
}: LessonHeaderProps) {
  const resetDialogRef = useFocusTrap(showResetConfirm);
  const resetDialogTitleId = useId();
  const resetDialogDescriptionId = useId();

  return (
    <section className="panel lesson-header-panel">
      <div className="lesson-headline">
        <h2>{selectedLesson.title}</h2>
        <span
          className={`status-pill ${progress[selectedLesson.id] ? "complete" : "pending"}`}
        >
          {progress[selectedLesson.id] ? "Completed" : "In progress"}
        </span>
      </div>
      <p className="lesson-overview">{selectedLesson.summary}</p>

      <div className="lesson-actions">
        {selectedPhase.courses.map((course) => (
          <button
            key={course.id}
            type="button"
            className={`course-chip ${selectedCourse.id === course.id ? "active" : ""}`}
            onClick={() => onSelectCourse(course.id)}
          >
            {course.title}
          </button>
        ))}
        <button
          type="button"
          className={`toggle-chip ${showCompletedOnly ? "active" : ""}`}
          onClick={onToggleCompletedOnly}
        >
          {showCompletedOnly ? "Showing completed only" : "Show completed only"}
        </button>
        <button
          type="button"
          className="ghost-button reset-lab-button"
          onClick={onResetLab}
        >
          ↺ Reset lab
        </button>
      </div>

      {showResetConfirm ? (
        <div className="confirm-backdrop" onClick={onCancelReset}>
          <div
            ref={resetDialogRef}
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={resetDialogTitleId}
            aria-describedby={resetDialogDescriptionId}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onCancelReset();
              }
            }}
          >
            <h4 id={resetDialogTitleId}>Reset all exercise data?</h4>
            <p id={resetDialogDescriptionId}>
              This will clear your answers, hints, feedback, and transfer
              progress for this lesson.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="ghost-button"
                autoFocus
                onClick={onCancelReset}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-destructive"
                onClick={onConfirmReset}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {lessonGateFeedback ? (
        <div className="gate-feedback-banner" role="alert">
          {lessonGateFeedback}
        </div>
      ) : null}

      <div className="lesson-meta">
        {selectedLesson.scaffoldingLevel ? (
          <span
            className={`scaffolding-badge scaffolding-${selectedLesson.scaffoldingLevel}`}
          >
            {selectedLesson.scaffoldingLevel === "step-by-step"
              ? "Guided"
              : selectedLesson.scaffoldingLevel === "goal-driven"
                ? "Goal-driven"
                : "Ticket-style"}
          </span>
        ) : null}
      </div>

      <nav className={styles.lessonToc} aria-label="Lesson sections">
        <a className={styles.lessonTocLink} href="#section-explanation">
          Concept
        </a>
        <a className={styles.lessonTocLink} href="#section-exercises">
          Exercises
        </a>
        {selectedLesson.exercises.length > 0 ? (
          <a className={styles.lessonTocLink} href="#section-validation">
            Validation
          </a>
        ) : null}
        {selectedLesson.transferTask ? (
          <a className={styles.lessonTocLink} href="#section-transfer">
            Transfer
          </a>
        ) : null}
        {selectedLesson.codeExercises &&
        selectedLesson.codeExercises.length > 0 ? (
          <a className={styles.lessonTocLink} href="#section-code">
            Code
          </a>
        ) : null}
        <a className={styles.lessonTocLink} href="#section-notes">
          Notes
        </a>
        {showTerminal ? (
          <a className={styles.lessonTocLink} href="#section-terminal">
            Terminal
          </a>
        ) : null}
      </nav>
    </section>
  );
}
