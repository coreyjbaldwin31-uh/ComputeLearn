import type { Lesson } from "@/data/curriculum";
import { formatTrackName } from "@/lib/progression-engine";

export type ReflectionContext = {
  lesson: Lesson;
  weakTracks: string[];
  isDueForReview: boolean;
  reviewCount: number;
};

export function buildReflectionPrompts(
  context: ReflectionContext,
): string[] {
  const prompts = [
    `What changed in your understanding of ${context.lesson.title} after doing the work?`,
  ];

  if (context.weakTracks.length > 0) {
    prompts.push(
      `What concrete step will you take to strengthen ${context.weakTracks
        .map(formatTrackName)
        .join(", ")}?`,
    );
  }

  if (context.lesson.retention.length > 0) {
    prompts.push(
      `Which retention cue will you reuse next time, and why: "${context.lesson.retention[0]}"?`,
    );
  }

  if (context.isDueForReview || context.reviewCount > 0) {
    prompts.push(
      "What signal told you that you remembered this correctly versus guessing?",
    );
  }

  if (prompts.length < 2) {
    prompts.push(
      "What mistake are you most likely to make in this lesson again, and how will you catch it earlier?",
    );
  }

  return prompts.slice(0, 4);
}

export function formatReflectionArtifactContent(
  lessonTitle: string,
  prompts: string[],
  response: string,
  weakTracks: string[],
): string {
  const focusLine =
    weakTracks.length > 0
      ? `Focus tracks: ${weakTracks.map(formatTrackName).join(", ")}`
      : "Focus tracks: General review";

  const promptBlock = prompts.map((prompt) => `- ${prompt}`).join("\n");

  return [
    `Reflection for ${lessonTitle}`,
    focusLine,
    "",
    "Prompt guide:",
    promptBlock,
    "",
    "Learner reflection:",
    response.trim(),
  ].join("\n");
}
