import type { Exercise, Lesson } from "@/data/curriculum";
import type { ArtifactRecord, AttemptRecord } from "@/lib/artifact-engine";
import {
  buildAttemptRecord,
  createId,
} from "@/lib/artifact-engine";
import {
  advanceHintLevel,
  getHintButtonLabel,
  getHintText,
  isHintExhausted,
} from "@/lib/hint-engine";
import { buildExerciseInspection } from "@/lib/inspection-engine";
import { evaluateExerciseAnswer } from "@/lib/validation-engine";
import { useCallback, useMemo, useState } from "react";

type ExerciseValidationConfig = {
  selectedLesson: Lesson | undefined;
  answers: Record<string, string>;
  setFeedback: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setLessonGateFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setAttempts: (
    fn: (current: AttemptRecord[]) => AttemptRecord[],
  ) => void;
  transferAnswers: Record<string, string>;
  setTransferFeedback: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  transferProgress: Record<string, true>;
  setTransferProgress: (
    fn: (current: Record<string, true>) => Record<string, true>,
  ) => void;
  addArtifact: (
    type: ArtifactRecord["type"],
    title: string,
    content: string,
    lessonId: string,
  ) => void;
};

export function useExerciseValidation({
  selectedLesson,
  answers,
  setFeedback,
  setLessonGateFeedback,
  setAttempts,
  transferAnswers,
  setTransferFeedback,
  transferProgress,
  setTransferProgress,
  addArtifact,
}: ExerciseValidationConfig) {
  const [hintLevels, setHintLevels] = useState<Record<string, number>>({});
  const [inspectionOpen, setInspectionOpen] = useState<Record<string, boolean>>(
    {},
  );

  const validateExercise = useCallback(
    (exercise: Exercise) => {
      if (!selectedLesson) return;
      const answer = answers[exercise.id] ?? "";
      const validation = evaluateExerciseAnswer(exercise, answer);
      const passed = validation.passed;

      setFeedback((current) => ({
        ...current,
        [exercise.id]: passed
          ? exercise.successMessage
          : (validation.hint ??
            "Not quite right. Check your answer and try again."),
      }));

      setLessonGateFeedback(null);

      const record = buildAttemptRecord({
        id: createId("attempt"),
        lessonId: selectedLesson.id,
        exerciseId: exercise.id,
        assessmentType: exercise.assessmentType ?? "action",
        answer,
        passed,
        attemptedAt: new Date().toISOString(),
      });
      setAttempts((current) => [record, ...current].slice(0, 500));
    },
    [answers, selectedLesson, setAttempts, setFeedback, setLessonGateFeedback],
  );

  const validateTransferTask = useCallback(() => {
    if (!selectedLesson?.transferTask) return;
    const answer = transferAnswers[selectedLesson.id] ?? "";
    const validation = evaluateExerciseAnswer(
      selectedLesson.transferTask,
      answer,
    );
    const passed = validation.passed;

    setTransferFeedback((current) => ({
      ...current,
      [selectedLesson.id]: passed
        ? selectedLesson.transferTask!.successMessage
        : (validation.hint ??
          "Transfer response needs more evidence. Refine your plan and try again."),
    }));

    setLessonGateFeedback(null);

    const record = buildAttemptRecord({
      id: createId("attempt"),
      lessonId: selectedLesson.id,
      exerciseId: selectedLesson.transferTask.id,
      assessmentType: "transfer",
      answer,
      passed,
      attemptedAt: new Date().toISOString(),
    });
    setAttempts((current) => [record, ...current].slice(0, 500));

    if (passed) {
      setTransferProgress((current) => ({
        ...current,
        [selectedLesson.id]: true,
      }));
      addArtifact(
        "transfer",
        `Transfer evidence: ${selectedLesson.title}`,
        answer,
        selectedLesson.id,
      );
    }
  }, [
    addArtifact,
    selectedLesson,
    setAttempts,
    setLessonGateFeedback,
    setTransferFeedback,
    setTransferProgress,
    transferAnswers,
  ]);

  const advanceHint = useCallback(
    (exerciseId: string) => {
      const key = `${selectedLesson?.id ?? ""}:${exerciseId}`;
      setHintLevels((prev) => ({
        ...prev,
        [key]: advanceHintLevel(prev[key] ?? 0),
      }));
    },
    [selectedLesson?.id],
  );

  const toggleInspection = useCallback(
    (exerciseId: string) => {
      const key = `${selectedLesson?.id ?? ""}:${exerciseId}`;
      setInspectionOpen((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    [selectedLesson?.id],
  );

  const currentHintLevels = useMemo(() => {
    const prefix = `${selectedLesson?.id ?? ""}:`;
    return Object.fromEntries(
      Object.entries(hintLevels)
        .filter(([k]) => k.startsWith(prefix))
        .map(([k, v]) => [k.slice(prefix.length), v]),
    );
  }, [hintLevels, selectedLesson?.id]);

  const isInspectionOpen = useCallback(
    (exerciseId: string) => {
      const key = `${selectedLesson?.id ?? ""}:${exerciseId}`;
      return Boolean(inspectionOpen[key]);
    },
    [inspectionOpen, selectedLesson?.id],
  );

  const selectedLessonTransferPassed = Boolean(
    selectedLesson ? transferProgress[selectedLesson.id] : false,
  );

  return {
    validateExercise,
    validateTransferTask,
    advanceHint,
    toggleInspection,
    currentHintLevels,
    isInspectionOpen,
    selectedLessonTransferPassed,
    hintLevels,
    setHintLevels,
    inspectionOpen,
  };
}

export { getHintButtonLabel, getHintText, isHintExhausted, evaluateExerciseAnswer, buildExerciseInspection };
