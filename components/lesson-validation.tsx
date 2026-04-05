"use client";

import type { Exercise, Lesson } from "@/data/curriculum";
import { RichText } from "./rich-text";
import {
  buildExerciseInspection,
  evaluateExerciseAnswer,
  getHintButtonLabel,
  getHintText,
  isHintExhausted,
} from "./hooks/use-exercise-validation";
import { InspectionPanel } from "./inspection-panel";

type LessonValidationProps = {
  lesson: Lesson;
  answers: Record<string, string>;
  feedback: Record<string, string>;
  currentHintLevels: Record<string, number>;
  inspectionOpenStates: Record<string, boolean>;
  onUpdateAnswer: (exerciseId: string, answer: string) => void;
  onValidateExercise: (exercise: Exercise) => void;
  onAdvanceHint: (exerciseId: string) => void;
  onToggleInspection: (exerciseId: string) => void;
};

export function LessonValidation({
  lesson,
  answers,
  feedback,
  currentHintLevels,
  inspectionOpenStates,
  onUpdateAnswer,
  onValidateExercise,
  onAdvanceHint,
  onToggleInspection,
}: LessonValidationProps) {
  return (
    <section className="validation-grid" id="section-validation">
      <div className="section-label">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="section-label-icon"
        >
          <path
            d="M4 8.5l3 3 5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Validation
      </div>
      {lesson.exercises.map((exercise) => {
        const exerciseAnswer = answers[exercise.id] ?? "";
        const exerciseFeedback = feedback[exercise.id];
        const validation = evaluateExerciseAnswer(exercise, exerciseAnswer);
        const isCorrect = validation.passed;
        const inspection = buildExerciseInspection(exercise, exerciseAnswer);
        const showInspection = inspectionOpenStates[exercise.id];

        return (
          <article className="exercise-card" key={exercise.id}>
            <div className="exercise-card-header">
              <h4>{exercise.title}</h4>
              {exercise.assessmentType ? (
                <span
                  className={`assessment-badge assessment-${exercise.assessmentType}`}
                >
                  {exercise.assessmentType}
                </span>
              ) : null}
            </div>
            <div className="exercise-prompt">
              <RichText content={exercise.prompt} />
            </div>
            <input
              aria-label={exercise.title}
              value={exerciseAnswer}
              onChange={(event) =>
                onUpdateAnswer(exercise.id, event.target.value)
              }
              placeholder={exercise.placeholder}
            />
            <div className="toolbar">
              <button
                type="button"
                className="validate-button"
                onClick={() => onValidateExercise(exercise)}
              >
                Validate
              </button>
              <button
                type="button"
                className="ghost-button"
                disabled={
                  isCorrect ||
                  isHintExhausted(currentHintLevels[exercise.id] ?? 0)
                }
                onClick={() => onAdvanceHint(exercise.id)}
              >
                {getHintButtonLabel(currentHintLevels[exercise.id] ?? 0)}
              </button>
              <button
                type="button"
                className="ghost-button"
                disabled={!exerciseAnswer.trim()}
                onClick={() => onToggleInspection(exercise.id)}
              >
                {showInspection ? "Hide inspect mode" : "Inspect response"}
              </button>
              <span
                className={`status-pill ${isCorrect ? "complete" : "pending"}`}
              >
                {isCorrect ? "✓ Ready" : "Needs review"}
              </span>
            </div>
            {exerciseFeedback ? (
              <div
                role="alert"
                className={`feedback ${isCorrect ? "success" : "warning"}`}
              >
                {exerciseFeedback}
              </div>
            ) : null}
            {getHintText(currentHintLevels[exercise.id] ?? 0, exercise.hint) !==
            null ? (
              <div className="hint-layer">
                <div className="hint-header">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="hint-icon"
                  >
                    <path
                      d="M8 1a4.5 4.5 0 0 0-2.5 8.2V11h5V9.2A4.5 4.5 0 0 0 8 1z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      fill="none"
                    />
                    <path
                      d="M6 13h4M6.5 11v1.5h3V11"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="hint-dots">
                    <span
                      className={`hint-dot ${(currentHintLevels[exercise.id] ?? 0) >= 1 ? "active" : ""}`}
                    />
                    <span
                      className={`hint-dot ${(currentHintLevels[exercise.id] ?? 0) >= 2 ? "active" : ""}`}
                    />
                  </span>
                </div>
                {getHintText(
                  currentHintLevels[exercise.id] ?? 0,
                  exercise.hint,
                )}
              </div>
            ) : null}
            {showInspection ? (
              <InspectionPanel inspection={inspection} />
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
