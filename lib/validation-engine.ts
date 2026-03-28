import type { Exercise, Lesson } from "@/data/curriculum";

export type ValidationCriterion = {
  id: string;
  description: string;
  passed: boolean;
  probableSkillGap?: string;
  hint?: string;
};

export type ValidationResult = {
  passed: boolean;
  criteria: ValidationCriterion[];
  failedCriteria: ValidationCriterion[];
  probableSkillGap?: string;
  hint?: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getProbableSkillGap(exercise: Exercise): string {
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

function toResult(criteria: ValidationCriterion[]): ValidationResult {
  const failedCriteria = criteria.filter((criterion) => !criterion.passed);
  const firstFailure = failedCriteria[0];
  return {
    passed: failedCriteria.length === 0,
    criteria,
    failedCriteria,
    probableSkillGap: firstFailure?.probableSkillGap,
    hint: firstFailure?.hint,
  };
}

export function evaluateExerciseAnswer(
  exercise: Exercise,
  answer: string,
): ValidationResult {
  const normalizedAnswer = normalize(answer);

  if (!normalizedAnswer) {
    return toResult([
      {
        id: `${exercise.id}-non-empty`,
        description: "Answer provided",
        passed: false,
        probableSkillGap: getProbableSkillGap(exercise),
        hint: "Add your answer before validating.",
      },
    ]);
  }

  const matchesAcceptedAnswer = exercise.acceptedAnswers.some(
    (acceptedAnswer) => {
      const normalizedAccepted = normalize(acceptedAnswer);
      if (exercise.validationMode === "exact") {
        return normalizedAnswer === normalizedAccepted;
      }
      const escaped = normalizedAccepted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`(?:^|\\b|\\s)${escaped}(?:\\b|\\s|$)`);
      return pattern.test(normalizedAnswer);
    },
  );

  return toResult([
    {
      id: `${exercise.id}-accepted-answer`,
      description: "Matches expected evidence",
      passed: matchesAcceptedAnswer,
      probableSkillGap: getProbableSkillGap(exercise),
      hint: exercise.hint,
    },
  ]);
}

export function evaluateLessonEvidenceGate(
  lesson: Lesson,
  answers: Record<string, string>,
  transferPassed: boolean,
): ValidationResult {
  const criteria: ValidationCriterion[] = lesson.exercises.map((exercise) => {
    const result = evaluateExerciseAnswer(exercise, answers[exercise.id] ?? "");
    return {
      id: `exercise-${exercise.id}`,
      description: `Exercise complete: ${exercise.title}`,
      passed: result.passed,
      probableSkillGap: result.probableSkillGap,
      hint: result.hint,
    };
  });

  if (lesson.transferTask) {
    criteria.push({
      id: `transfer-${lesson.transferTask.id}`,
      description: "Transfer evidence passed",
      passed: transferPassed,
      probableSkillGap: "Transfer ability",
      hint: "Validate the transfer task to unlock lesson completion.",
    });
  }

  return toResult(criteria);
}