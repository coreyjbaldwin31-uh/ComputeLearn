/**
 * Pure functions for the layered hint system used in lab exercises.
 * All functions are stateless — hint state is owned by the calling component.
 */

export const MAX_HINT_LEVEL = 2;

/**
 * The generic level-1 hint shown before revealing the exercise-specific hint.
 * Encourages the learner to reason before receiving the full answer.
 */
export const GENERIC_HINT_TEXT =
  "Take a closer look at the question. Think about the core concept being tested, then try again.";

/**
 * Advances the hint level by one, capped at MAX_HINT_LEVEL.
 */
export function advanceHintLevel(current: number): number {
  return Math.min(MAX_HINT_LEVEL, current + 1);
}

/**
 * Returns true when the hint system has reached its maximum level and
 * the hint button should be disabled.
 */
export function isHintExhausted(level: number): boolean {
  return level >= MAX_HINT_LEVEL;
}

/**
 * Returns the label for the hint button at a given hint level.
 */
export function getHintButtonLabel(level: number): string {
  if (level === 0) return "Need a hint?";
  if (level === 1) return "More help";
  return "Hint shown";
}

/**
 * Returns the hint text to display at a given level, or null if no hint
 * should be shown yet.
 *
 * - Level 0: no hint
 * - Level 1: generic directional nudge
 * - Level 2+: the exercise-specific hint text
 */
export function getHintText(
  level: number,
  exerciseHint: string,
): string | null {
  if (level === 0) return null;
  if (level === 1) return GENERIC_HINT_TEXT;
  return exerciseHint;
}
