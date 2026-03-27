import { describe, expect, it } from "vitest";
import type { ArtifactRecord } from "./artifact-engine";
import {
  buildArtifactExportDocument,
  buildArtifactExportFilename,
} from "./artifact-export-engine";
import type { LessonEntry } from "./progression-engine";

const entries: LessonEntry[] = [
  {
    phase: { id: "phase-1", title: "Phase 1", strapline: "", purpose: "", level: "", duration: "", environment: "", tools: [], guardrails: [], milestones: [], projects: [], courses: [] },
    course: { id: "course-1", title: "Course 1", focus: "", outcome: "", lessons: [] },
    lesson: {
      id: "lesson-1",
      title: "Lesson 1",
      summary: "",
      duration: "",
      difficulty: "",
      objective: "",
      explanation: [],
      demonstration: [],
      exerciseSteps: [],
      validationChecks: [],
      retention: [],
      tools: [],
      notesPrompt: "",
      exercises: [],
    },
  },
  {
    phase: { id: "phase-2", title: "Phase 2", strapline: "", purpose: "", level: "", duration: "", environment: "", tools: [], guardrails: [], milestones: [], projects: [], courses: [] },
    course: { id: "course-2", title: "Course 2", focus: "", outcome: "", lessons: [] },
    lesson: {
      id: "lesson-2",
      title: "Lesson 2",
      summary: "",
      duration: "",
      difficulty: "",
      objective: "",
      explanation: [],
      demonstration: [],
      exerciseSteps: [],
      validationChecks: [],
      retention: [],
      tools: [],
      notesPrompt: "",
      exercises: [],
    },
  },
];

const artifacts: ArtifactRecord[] = [
  {
    id: "a1",
    lessonId: "lesson-1",
    type: "note",
    title: "Lesson note",
    content: "first artifact",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "a2",
    lessonId: "lesson-1",
    type: "reflection",
    title: "Reflection checkpoint",
    content: "second artifact",
    createdAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "a3",
    lessonId: "lesson-2",
    type: "transfer",
    title: "Transfer evidence",
    content: "third artifact",
    createdAt: "2025-01-03T00:00:00.000Z",
  },
];

describe("artifact export engine", () => {
  it("builds a lesson-scoped export document", () => {
    const document = buildArtifactExportDocument(artifacts, entries, {
      lessonId: "lesson-1",
      generatedAt: "2025-01-04T00:00:00.000Z",
    });

    expect(document).toContain("Scope: lesson-1");
    expect(document).toContain("## Lesson 1");
    expect(document).not.toContain("## Lesson 2");
    expect(document.indexOf("Reflection checkpoint")).toBeLessThan(
      document.indexOf("Lesson note"),
    );
  });

  it("builds an all-lessons export and filenames", () => {
    const document = buildArtifactExportDocument(artifacts, entries, {
      generatedAt: "2025-01-04T00:00:00.000Z",
    });

    expect(document).toContain("Total artifacts: 3");
    expect(document).toContain("## Lesson 1");
    expect(document).toContain("## Lesson 2");
    expect(buildArtifactExportFilename()).toBe("computelearn-evidence.md");
    expect(buildArtifactExportFilename("lesson-1")).toBe(
      "lesson-1-evidence.md",
    );
  });
});