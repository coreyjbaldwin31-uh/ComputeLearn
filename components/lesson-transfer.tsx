"use client";

import type { Lesson } from "@/data/curriculum";
import {
  buildExerciseInspection,
  getHintButtonLabel,
  getHintText,
  isHintExhausted,
} from "./hooks/use-exercise-validation";
import { InspectionPanel } from "./inspection-panel";

type LessonTransferProps = {
  lesson: Lesson;
  transferAnswers: Record<string, string>;
  transferFeedback: Record<string, string>;
  currentHintLevels: Record<string, number>;
  inspectionOpenStates: Record<string, boolean>;
  selectedLessonTransferPassed: boolean;
  onUpdateTransferAnswer: (lessonId: string, answer: string) => void;
  onValidateTransferTask: () => void;
  onAdvanceHint: (exerciseId: string) => void;
  onToggleInspection: (exerciseId: string) => void;
};

export function LessonTransfer({
  lesson,
  transferAnswers,
  transferFeedback,
  currentHintLevels,
  inspectionOpenStates,
  selectedLessonTransferPassed,
  onUpdateTransferAnswer,
  onValidateTransferTask,
  onAdvanceHint,
  onToggleInspection,
}: LessonTransferProps) {
  const transferTask = lesson.transferTask;
  if (!transferTask) return null;

  const transferInspection = buildExerciseInspection(
    transferTask,
    transferAnswers[lesson.id] ?? "",
  );
  const showTransferInspection = inspectionOpenStates[transferTask.id];

  return (
    <section className="validation-grid" id="section-transfer">
      <div className="section-label"><span className="section-label-icon">🎯</span> Transfer</div>
      <article className="exercise-card transfer-task-card">
        <div className="exercise-card-header">
          <h4>{transferTask.title}</h4>
          <span className="assessment-badge assessment-transfer">transfer</span>
        </div>
        <p>{transferTask.prompt}</p>
        <textarea
          aria-label={transferTask.title}
          value={transferAnswers[lesson.id] ?? ""}
          onChange={(event) =>
            onUpdateTransferAnswer(lesson.id, event.target.value)
          }
          placeholder={transferTask.placeholder}
          rows={4}
        />
        <div className="toolbar">
          <button
            type="button"
            className="validate-button"
            onClick={onValidateTransferTask}
          >
            Validate transfer
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={
              selectedLessonTransferPassed ||
              isHintExhausted(currentHintLevels[transferTask.id] ?? 0)
            }
            onClick={() => onAdvanceHint(transferTask.id)}
          >
            {getHintButtonLabel(currentHintLevels[transferTask.id] ?? 0)}
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={!(transferAnswers[lesson.id] ?? "").trim()}
            onClick={() => onToggleInspection(transferTask.id)}
          >
            {showTransferInspection ? "Hide inspect mode" : "Inspect response"}
          </button>
          <span
            className={`status-pill ${selectedLessonTransferPassed ? "complete" : "pending"}`}
          >
            {selectedLessonTransferPassed ? "Passed" : "Not passed"}
          </span>
        </div>
        {transferFeedback[lesson.id] ? (
          <div
            role="alert"
            className={`feedback ${selectedLessonTransferPassed ? "success" : "warning"}`}
          >
            {transferFeedback[lesson.id]}
          </div>
        ) : null}
        {getHintText(
          currentHintLevels[transferTask.id] ?? 0,
          transferTask.hint,
        ) !== null ? (
          <div className="hint-layer">
            {getHintText(
              currentHintLevels[transferTask.id] ?? 0,
              transferTask.hint,
            )}
          </div>
        ) : null}
        {showTransferInspection ? (
          <InspectionPanel
            inspection={transferInspection}
            keyPrefix="transfer-"
          />
        ) : null}
      </article>
    </section>
  );
}
