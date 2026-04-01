"use client";

import type { Exercise, Lesson } from "@/data/curriculum";
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
            <p>{exercise.prompt}</p>
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
