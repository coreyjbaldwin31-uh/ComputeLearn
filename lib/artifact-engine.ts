/**
 * Pure factory and formatting functions for Attempt and Artifact records.
 * All functions are stateless and side-effect free — suitable for unit testing.
 */

export type ArtifactType = "note" | "completion" | "transfer" | "reflection";

export type ArtifactRecord = {
  id: string;
  lessonId: string;
  type: ArtifactType;
  title: string;
  content: string;
  createdAt: string;
};

export type AttemptRecord = {
  id: string;
  lessonId: string;
  exerciseId: string;
  assessmentType: string;
  answer: string;
  passed: boolean;
  attemptedAt: string;
};

/**
 * Generates a unique prefixed identifier.
 * Not suitable for cryptographic purposes — use for UI record correlation only.
 */
export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Formats the content string for a lesson completion artifact.
 */
export function formatCompletionContent(
  lessonTitle: string,
  exerciseCount: number,
  transferPassed: boolean,
): string {
  const transferNote = transferPassed ? "passed" : "not required";
  return `${lessonTitle}: completed with ${exerciseCount} validation checks and transfer evidence ${transferNote}.`;
}

/**
 * Builds a new ArtifactRecord. The caller is responsible for providing a
 * non-empty, already-trimmed content string.
 */
export function buildArtifactRecord(params: {
  id: string;
  lessonId: string;
  type: ArtifactType;
  title: string;
  content: string;
  createdAt: string;
}): ArtifactRecord {
  return { ...params };
}

/**
 * Builds a new AttemptRecord.
 */
export function buildAttemptRecord(params: {
  id: string;
  lessonId: string;
  exerciseId: string;
  assessmentType: string;
  answer: string;
  passed: boolean;
  attemptedAt: string;
}): AttemptRecord {
  return { ...params };
}
