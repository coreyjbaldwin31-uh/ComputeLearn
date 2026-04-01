import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useExerciseValidation } from "./hooks/use-exercise-validation";
import type { Lesson, Exercise } from "@/data/curriculum";

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: "ex-1",
    title: "Test exercise",
    prompt: "What is 2+2?",
    placeholder: "Answer",
    validationMode: "exact" as const,
    acceptedAnswers: ["4"],
    successMessage: "Correct!",
    hint: "Try counting",
    assessmentType: "action" as const,
    ...overrides,
  };
}

function makeLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: "lesson-test",
    title: "Test lesson",
    summary: "A test lesson",
    duration: "10 min",
    difficulty: "Core" as const,
    objective: "Test objective",
    explanation: ["Test explanation"],
    demonstration: ["Test demo"],
    exerciseSteps: ["Step 1"],
    validationChecks: ["Check 1"],
    retention: ["Remember this"],
    tools: ["VS Code"],
    notesPrompt: "Take notes",
    exercises: [makeExercise()],
    transferTask: {
      id: "transfer-test",
      title: "Transfer test",
      prompt: "Apply knowledge",
      placeholder: "Answer",
      validationMode: "includes" as const,
      acceptedAnswers: ["correct"],
      successMessage: "Transfer passed!",
      hint: "Think broadly",
      assessmentType: "transfer" as const,
    },
    competencies: [],
    scaffoldingLevel: "step-by-step" as const,
    ...overrides,
  };
}

function createConfig(overrides: Record<string, unknown> = {}) {
  return {
    selectedLesson: makeLesson() as Lesson | undefined,
    answers: {} as Record<string, string>,
    setFeedback: vi.fn(),
    setLessonGateFeedback: vi.fn(),
    setAttempts: vi.fn(),
    transferAnswers: {} as Record<string, string>,
    setTransferFeedback: vi.fn(),
    transferProgress: {} as Record<string, true>,
    setTransferProgress: vi.fn(),
    addArtifact: vi.fn(),
    ...overrides,
  };
}

describe("useExerciseValidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns expected shape", () => {
    const { result } = renderHook(() => useExerciseValidation(createConfig()));
    expect(result.current).toHaveProperty("validateExercise");
    expect(result.current).toHaveProperty("validateTransferTask");
    expect(result.current).toHaveProperty("advanceHint");
    expect(result.current).toHaveProperty("toggleInspection");
    expect(result.current).toHaveProperty("currentHintLevels");
    expect(result.current).toHaveProperty("isInspectionOpen");
    expect(result.current).toHaveProperty("selectedLessonTransferPassed");
    expect(result.current).toHaveProperty("setHintLevels");
  });

  it("validateExercise sets success feedback for correct answer", () => {
    const setFeedback = vi.fn();
    const setAttempts = vi.fn();
    const config = createConfig({
      answers: { "ex-1": "4" },
      setFeedback,
      setAttempts,
    });

    const { result } = renderHook(() => useExerciseValidation(config));

    act(() => {
      result.current.validateExercise(makeExercise());
    });

    expect(setFeedback).toHaveBeenCalled();
    const updater = setFeedback.mock.calls[0][0];
    const state = typeof updater === "function" ? updater({}) : updater;
    expect(state["ex-1"]).toBe("Correct!");
  });

  it("validateExercise sets failure feedback for wrong answer", () => {
    const setFeedback = vi.fn();
    const config = createConfig({
      answers: { "ex-1": "wrong" },
      setFeedback,
    });

    const { result } = renderHook(() => useExerciseValidation(config));

    act(() => {
      result.current.validateExercise(makeExercise());
    });

    const updater = setFeedback.mock.calls[0][0];
    const state = typeof updater === "function" ? updater({}) : updater;
    expect(state["ex-1"]).not.toBe("Correct!");
  });

  it("validateExercise records attempt", () => {
    const setAttempts = vi.fn();
    const config = createConfig({
      answers: { "ex-1": "4" },
      setAttempts,
    });

    const { result } = renderHook(() => useExerciseValidation(config));

    act(() => {
      result.current.validateExercise(makeExercise());
    });

    expect(setAttempts).toHaveBeenCalled();
  });

  it("validateTransferTask sets transfer progress on success", () => {
    const setTransferProgress = vi.fn();
    const setTransferFeedback = vi.fn();
    const addArtifact = vi.fn();
    const config = createConfig({
      transferAnswers: { "lesson-test": "correct answer" },
      setTransferProgress,
      setTransferFeedback,
      addArtifact,
    });

    const { result } = renderHook(() => useExerciseValidation(config));

    act(() => {
      result.current.validateTransferTask();
    });

    expect(setTransferProgress).toHaveBeenCalled();
    expect(addArtifact).toHaveBeenCalledWith(
      "transfer",
      expect.stringContaining("Transfer evidence"),
      "correct answer",
      "lesson-test",
    );
  });

  it("validateTransferTask does not set progress on failure", () => {
    const setTransferProgress = vi.fn();
    const config = createConfig({
      transferAnswers: { "lesson-test": "wrong" },
      setTransferProgress,
    });

    const { result } = renderHook(() => useExerciseValidation(config));

    act(() => {
      result.current.validateTransferTask();
    });

    expect(setTransferProgress).not.toHaveBeenCalled();
  });

  it("advanceHint increments hint level", () => {
    const config = createConfig();
    const { result } = renderHook(() => useExerciseValidation(config));

    act(() => {
      result.current.advanceHint("ex-1");
    });

    expect(result.current.currentHintLevels["ex-1"]).toBe(1);

    act(() => {
      result.current.advanceHint("ex-1");
    });

    expect(result.current.currentHintLevels["ex-1"]).toBe(2);
  });

  it("toggleInspection toggles state", () => {
    const config = createConfig();
    const { result } = renderHook(() => useExerciseValidation(config));

    expect(result.current.isInspectionOpen("ex-1")).toBe(false);

    act(() => {
      result.current.toggleInspection("ex-1");
    });

    expect(result.current.isInspectionOpen("ex-1")).toBe(true);

    act(() => {
      result.current.toggleInspection("ex-1");
    });

    expect(result.current.isInspectionOpen("ex-1")).toBe(false);
  });

  it("selectedLessonTransferPassed reflects transfer progress", () => {
    const config = createConfig({
      transferProgress: { "lesson-test": true as const },
    });
    const { result } = renderHook(() => useExerciseValidation(config));
    expect(result.current.selectedLessonTransferPassed).toBe(true);
  });

  it("selectedLessonTransferPassed is false when not passed", () => {
    const config = createConfig({ transferProgress: {} });
    const { result } = renderHook(() => useExerciseValidation(config));
    expect(result.current.selectedLessonTransferPassed).toBe(false);
  });

  it("does nothing when selectedLesson is undefined", () => {
    const setFeedback = vi.fn();
    const config = createConfig({
      selectedLesson: undefined,
      setFeedback,
    });

    const { result } = renderHook(() => useExerciseValidation(config));

    act(() => {
      result.current.validateExercise(makeExercise());
    });

    expect(setFeedback).not.toHaveBeenCalled();
  });
});
