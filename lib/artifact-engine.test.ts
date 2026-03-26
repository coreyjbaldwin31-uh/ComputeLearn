import { describe, expect, it } from "vitest";
import {
    buildArtifactRecord,
    buildAttemptRecord,
    createId,
    formatCompletionContent,
} from "./artifact-engine";

describe("createId", () => {
  it("returns a string starting with the given prefix", () => {
    const id = createId("artifact");
    expect(id.startsWith("artifact-")).toBe(true);
  });

  it("generates unique ids on successive calls", () => {
    const ids = Array.from({ length: 20 }, () => createId("x"));
    const unique = new Set(ids);
    expect(unique.size).toBe(20);
  });
});

describe("formatCompletionContent", () => {
  it("formats content with transfer passed", () => {
    const result = formatCompletionContent("Intro to Git", 3, true);
    expect(result).toContain("Intro to Git");
    expect(result).toContain("3 validation checks");
    expect(result).toContain("transfer evidence passed");
  });

  it("formats content with transfer not required", () => {
    const result = formatCompletionContent("File Operations", 2, false);
    expect(result).toContain("transfer evidence not required");
  });
});

describe("buildArtifactRecord", () => {
  it("returns an artifact with all provided fields", () => {
    const artifact = buildArtifactRecord({
      id: "artifact-001",
      lessonId: "lesson-filesystem",
      type: "completion",
      title: "Lesson completion snapshot",
      content: "Filesystem: completed.",
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    expect(artifact.id).toBe("artifact-001");
    expect(artifact.lessonId).toBe("lesson-filesystem");
    expect(artifact.type).toBe("completion");
    expect(artifact.title).toBe("Lesson completion snapshot");
    expect(artifact.content).toBe("Filesystem: completed.");
    expect(artifact.createdAt).toBe("2024-01-01T00:00:00.000Z");
  });

  it("supports note and transfer artifact types", () => {
    const note = buildArtifactRecord({
      id: "n1",
      lessonId: "lesson-debugging",
      type: "note",
      title: "Lesson note",
      content: "My notes.",
      createdAt: "2024-06-01T00:00:00.000Z",
    });
    expect(note.type).toBe("note");

    const transfer = buildArtifactRecord({
      id: "t1",
      lessonId: "lesson-git-workflow",
      type: "transfer",
      title: "Transfer evidence: Use Git as a Safety System",
      content: "Step 1: reproduce, Step 2: investigate, Step 3: verify.",
      createdAt: "2024-06-01T00:00:00.000Z",
    });
    expect(transfer.type).toBe("transfer");
  });
});

describe("buildAttemptRecord", () => {
  it("returns an attempt record with all provided fields", () => {
    const attempt = buildAttemptRecord({
      id: "attempt-001",
      lessonId: "lesson-git-workflow",
      exerciseId: "git-status",
      assessmentType: "action",
      answer: "git status",
      passed: true,
      attemptedAt: "2024-01-01T00:00:00.000Z",
    });

    expect(attempt.id).toBe("attempt-001");
    expect(attempt.lessonId).toBe("lesson-git-workflow");
    expect(attempt.exerciseId).toBe("git-status");
    expect(attempt.assessmentType).toBe("action");
    expect(attempt.answer).toBe("git status");
    expect(attempt.passed).toBe(true);
    expect(attempt.attemptedAt).toBe("2024-01-01T00:00:00.000Z");
  });

  it("handles a failed attempt", () => {
    const attempt = buildAttemptRecord({
      id: "attempt-002",
      lessonId: "lesson-debugging",
      exerciseId: "debug-loop",
      assessmentType: "debugging",
      answer: "just edit the code",
      passed: false,
      attemptedAt: "2024-06-01T00:00:00.000Z",
    });
    expect(attempt.passed).toBe(false);
    expect(attempt.assessmentType).toBe("debugging");
  });
});
