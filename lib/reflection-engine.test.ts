import { describe, expect, it } from "vitest";
import {
    buildReflectionPrompts,
    formatReflectionArtifactContent,
} from "./reflection-engine";

const lesson = {
  id: "lesson-debugging",
  title: "Debugging Foundations",
  summary: "",
  duration: "",
  difficulty: "",
  objective: "",
  explanation: [],
  demonstration: [],
  exerciseSteps: [],
  validationChecks: [],
  retention: ["Reproduce before you modify."],
  tools: [],
  notesPrompt: "",
  exercises: [],
};

describe("buildReflectionPrompts", () => {
  it("builds prompts from lesson, weak tracks, and retention cues", () => {
    const prompts = buildReflectionPrompts({
      lesson,
      weakTracks: ["Debugging", "VersionControl"],
      isDueForReview: true,
      reviewCount: 2,
    });

    expect(prompts[0]).toContain("Debugging Foundations");
    expect(prompts.join(" ")).toContain("Debugging");
    expect(prompts.join(" ")).toContain("Reproduce before you modify.");
    expect(prompts).toHaveLength(4);
  });

  it("falls back to a general mistake prompt when there are fewer cues", () => {
    const prompts = buildReflectionPrompts({
      lesson: { ...lesson, retention: [] },
      weakTracks: [],
      isDueForReview: false,
      reviewCount: 0,
    });

    expect(prompts).toHaveLength(2);
    expect(prompts[1]).toContain("mistake");
  });
});

describe("formatReflectionArtifactContent", () => {
  it("formats reflection content with focus tracks and prompt guide", () => {
    const content = formatReflectionArtifactContent(
      "Debugging Foundations",
      ["What changed?", "What will you strengthen next?"],
      "I will reproduce the bug before editing code.",
      ["Debugging", "VersionControl"],
    );

    expect(content).toContain("Reflection for Debugging Foundations");
    expect(content).toContain("Focus tracks: Debugging, Version Control");
    expect(content).toContain("Prompt guide:");
    expect(content).toContain("Learner reflection:");
    expect(content).toContain("I will reproduce the bug before editing code.");
  });

  it("uses general review label when there are no weak tracks", () => {
    const content = formatReflectionArtifactContent(
      "Lesson",
      ["Prompt"],
      "Answer",
      [],
    );

    expect(content).toContain("Focus tracks: General review");
  });
});
