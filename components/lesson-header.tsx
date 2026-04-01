"use client";

import type { Course, Lesson, Phase } from "@/data/curriculum";

type LessonHeaderProps = {
  selectedPhase: Phase;
  selectedCourse: Course;
  selectedLesson: Lesson;
  progress: Record<string, true>;
  showCompletedOnly: boolean;
  showResetConfirm: boolean;
  lessonGateFeedback: string | null;
  onSelectPhase: (phaseId: string) => void;
  onSelectCourse: (courseId: string) => void;
  onToggleCompletedOnly: () => void;
  onToggleLessonCompletion: (lessonId: string, completed: boolean) => void;
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
  onSelectPhase,
  onSelectCourse,
  onToggleCompletedOnly,
  onToggleLessonCompletion,
  onResetLab,
  onCancelReset,
  onConfirmReset,
  showTerminal,
}: LessonHeaderProps) {
  return (
    <section className="panel">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <button
          type="button"
          className="breadcrumb-link"
          onClick={() => onSelectPhase(selectedPhase.id)}
        >
          {selectedPhase.title}
        </button>
        <span>›</span>
        <button
          type="button"
          className="breadcrumb-link"
          onClick={() => onSelectCourse(selectedCourse.id)}
        >
          {selectedCourse.title}
        </button>
        <span>›</span>
        <span>{selectedLesson.title}</span>
      </nav>

      <div className="lesson-headline">
        <span className="eyebrow">Current lesson</span>
        <span
          className={`status-pill ${progress[selectedLesson.id] ? "complete" : "pending"}`}
        >
          {progress[selectedLesson.id] ? "Completed" : "In progress"}
        </span>
      </div>
      <h2>{selectedLesson.title}</h2>
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
          className={`mark-complete-button ${progress[selectedLesson.id] ? "completed" : ""}`}
          onClick={() =>
            onToggleLessonCompletion(
              selectedLesson.id,
              !progress[selectedLesson.id],
            )
          }
        >
          {progress[selectedLesson.id]
            ? "✓ Completed — mark incomplete"
            : "Mark complete ✓"}
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
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm reset"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Reset all exercise data?</h4>
            <p>
              This will clear your answers, hints, feedback, and transfer
              progress for this lesson.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="ghost-button"
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
        <span className="metric-pill">{selectedLesson.duration}</span>
        <span className="metric-pill">{selectedLesson.difficulty}</span>
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

      <nav className="lesson-toc" aria-label="Lesson sections">
        <a className="lesson-toc-link" href="#section-explanation">
          Concept
        </a>
        <a className="lesson-toc-link" href="#section-exercises">
          Exercises
        </a>
        {selectedLesson.exercises.length > 0 ? (
          <a className="lesson-toc-link" href="#section-validation">
            Validation
          </a>
        ) : null}
        {selectedLesson.transferTask ? (
          <a className="lesson-toc-link" href="#section-transfer">
            Transfer
          </a>
        ) : null}
        {selectedLesson.codeExercises &&
        selectedLesson.codeExercises.length > 0 ? (
          <a className="lesson-toc-link" href="#section-code">
            Code
          </a>
        ) : null}
        <a className="lesson-toc-link" href="#section-notes">
          Notes
        </a>
        {showTerminal ? (
          <a className="lesson-toc-link" href="#section-terminal">
            Terminal
          </a>
        ) : null}
      </nav>
    </section>
  );
}
