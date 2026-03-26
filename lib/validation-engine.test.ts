import { describe, expect, it } from "vitest";
import {
    evaluateExerciseAnswer,
    evaluateLessonEvidenceGate,
} from "./validation-engine";

describe("validation-engine", () => {
  it("fails on empty answer with actionable hint", () => {
    const exercise = {
      id: "e1",
      title: "Context check",
      prompt: "Prompt",
      placeholder: "Type answer",
      validationMode: "includes" as const,
      acceptedAnswers: ["pwd"],
      successMessage: "ok",
      hint: "Use pwd",
      assessmentType: "action" as const,
    };

    const result = evaluateExerciseAnswer(exercise, "");

    expect(result.passed).toBe(false);
    expect(result.failedCriteria.length).toBe(1);
    expect(result.hint).toContain("Add your answer");
  });

  it("passes exact validation with normalized answer", () => {
    const exercise = {
      id: "e2",
      title: "Pipe operator",
      prompt: "Prompt",
      placeholder: "|",
      validationMode: "exact" as const,
      acceptedAnswers: ["|"],
      successMessage: "ok",
      hint: "Vertical bar",
      assessmentType: "reasoning" as const,
    };

    const result = evaluateExerciseAnswer(exercise, "   |   ");

    expect(result.passed).toBe(true);
    expect(result.failedCriteria).toEqual([]);
  });

  it("requires transfer task evidence in lesson gate", () => {
    const lesson = {
      id: "l1",
      title: "Filesystem",
      summary: "summary",
      duration: "10m",
      difficulty: "Core",
      objective: "obj",
      explanation: [],
      demonstration: [],
      exerciseSteps: [],
      validationChecks: [],
      retention: [],
      tools: [],
      notesPrompt: "notes",
      exercises: [
        {
          id: "ex-1",
          title: "Exercise",
          prompt: "Prompt",
          placeholder: "",
          validationMode: "includes" as const,
          acceptedAnswers: ["pwd"],
          successMessage: "ok",
          hint: "Use pwd",
        },
      ],
      transferTask: {
        id: "tx-1",
        title: "Transfer",
        prompt: "Prompt",
        placeholder: "",
        validationMode: "includes" as const,
        acceptedAnswers: ["inspect"],
        successMessage: "ok",
        hint: "Need transfer",
      },
    };

    const withoutTransfer = evaluateLessonEvidenceGate(
      lesson,
      { "ex-1": "pwd" },
      false,
    );

    expect(withoutTransfer.passed).toBe(false);
    expect(withoutTransfer.failedCriteria.some((c) => c.id.startsWith("transfer-"))).toBe(true);

    const withTransfer = evaluateLessonEvidenceGate(
      lesson,
      { "ex-1": "pwd" },
      true,
    );

    expect(withTransfer.passed).toBe(true);
  });

  it("passes includes-mode when answer contains the accepted substring regardless of case", () => {
    const exercise = {
      id: "e3",
      title: "Case insensitive",
      prompt: "What command lists processes?",
      placeholder: "...",
      validationMode: "includes" as const,
      acceptedAnswers: ["get-process"],
      successMessage: "ok",
      hint: "Get-Process",
    };

    const result = evaluateExerciseAnswer(exercise, "   GET-PROCESS  ");
    expect(result.passed).toBe(true);
  });

  it("fails exact mode when answer contains extra characters", () => {
    const exercise = {
      id: "e4",
      title: "Exact match",
      prompt: "Symbol?",
      placeholder: "|",
      validationMode: "exact" as const,
      acceptedAnswers: ["|"],
      successMessage: "ok",
      hint: "Pipe",
    };

    const result = evaluateExerciseAnswer(exercise, " | extra");
    expect(result.passed).toBe(false);
  });

  it("passes when any one of multiple accepted answers matches", () => {
    const exercise = {
      id: "e5",
      title: "Multiple accepted",
      prompt: "List files?",
      placeholder: "...",
      validationMode: "includes" as const,
      acceptedAnswers: ["get-childitem", "dir", "ls"],
      successMessage: "ok",
      hint: "There are several aliases",
    };

    expect(evaluateExerciseAnswer(exercise, "ls").passed).toBe(true);
    expect(evaluateExerciseAnswer(exercise, "dir").passed).toBe(true);
    expect(evaluateExerciseAnswer(exercise, "get-childitem").passed).toBe(true);
    expect(evaluateExerciseAnswer(exercise, "whoami").passed).toBe(false);
  });

  it("returns a skill gap label matching the assessment type", () => {
    const exercise = {
      id: "e6",
      title: "Debugging",
      prompt: "Debug?",
      placeholder: "...",
      validationMode: "includes" as const,
      acceptedAnswers: ["never-matches"],
      successMessage: "ok",
      hint: "hint",
      assessmentType: "debugging" as const,
    };

    const result = evaluateExerciseAnswer(exercise, "wrong answer");
    expect(result.probableSkillGap).toBe("Debugging accuracy");
  });
});
