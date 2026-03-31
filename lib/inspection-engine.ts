import type { Exercise } from "@/data/curriculum";
import { evaluateExerciseAnswer } from "./validation-engine";

export type ExerciseInspection = {
  passed: boolean;
  probableSkillGap: string;
  observedEvidence: string[];
  matchedSignals: string[];
  missingSignals: string[];
  extraSignals: string[];
  signalDiff: string[];
  inspectionPrompts: string[];
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .flatMap((value) => normalize(value).split(/[^a-z0-9]+/i))
        .map((token) => token.trim())
        .filter((token) => token.length >= 3),
    ),
  );
}

function buildInspectionPrompts(exercise: Exercise): string[] {
  switch (exercise.assessmentType) {
    case "debugging":
      return [
        "What symptom did you observe, and what separate condition could be causing it?",
        "Which signal or log line would prove the root cause instead of only describing the failure?",
        "What is the smallest fix or next check that would reduce uncertainty?",
      ];
    case "reasoning":
      return [
        "Which concept from the prompt is still missing from your explanation?",
        "What term or relationship would make your reasoning verifiable?",
      ];
    case "transfer":
      return [
        "Which real-world deliverable or verification step is still missing?",
        "What would another developer need in order to trust and reuse this result?",
      ];
    default:
      return [
        "Which expected signal is still absent from your answer?",
        "What exact output, term, or action would make the evidence complete?",
      ];
  }
}

function getSkillGapLabel(exercise: Exercise): string {
  switch (exercise.assessmentType) {
    case "reasoning":
      return "Reasoning quality";
    case "debugging":
      return "Debugging accuracy";
    case "transfer":
      return "Transfer ability";
    default:
      return "Action correctness";
  }
}

export function buildExerciseInspection(
  exercise: Exercise,
  answer: string,
): ExerciseInspection {
  const validation = evaluateExerciseAnswer(exercise, answer);
  const expectedSignals = tokenize(exercise.acceptedAnswers);
  const observedEvidence = tokenize([answer]);
  const observedSet = new Set(observedEvidence);
  const matchedSignals = expectedSignals.filter((signal) =>
    observedSet.has(signal),
  );
  const missingSignals = expectedSignals.filter(
    (signal) => !observedSet.has(signal),
  );
  const expectedSet = new Set(expectedSignals);
  const extraSignals = observedEvidence.filter((signal) => !expectedSet.has(signal));
  const signalDiff = [
    ...matchedSignals.map((signal) => `+ ${signal}`),
    ...missingSignals.map((signal) => `- ${signal}`),
    ...extraSignals.slice(0, 8).map((signal) => `~ ${signal}`),
  ];

  return {
    passed: validation.passed,
    probableSkillGap: validation.probableSkillGap ?? getSkillGapLabel(exercise),
    observedEvidence,
    matchedSignals,
    missingSignals,
    extraSignals,
    signalDiff,
    inspectionPrompts: buildInspectionPrompts(exercise),
  };
}
