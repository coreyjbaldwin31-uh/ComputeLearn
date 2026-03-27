import { describe, expect, it } from "vitest";
import { curriculum } from "../data/curriculum";
import type { ArtifactRecord } from "./artifact-engine";
import { buildIndependentReadinessSummary } from "./independent-readiness-engine";

const phaseFour = curriculum.phases.find((phase) => phase.id === "phase-4");

if (!phaseFour) {
  throw new Error("Expected phase-4 to exist in curriculum test fixture.");
}

const phaseFourLessons = phaseFour.courses.flatMap((course) => course.lessons);
const capstoneLessons = phaseFourLessons.filter((lesson) =>
  /capstone|portfolio/i.test(`${lesson.id} ${lesson.title}`),
);
const coreLessons = phaseFourLessons.filter(
  (lesson) => !/capstone|portfolio/i.test(`${lesson.id} ${lesson.title}`),
);

function buildArtifact(
  id: string,
  lessonId: string,
  type: ArtifactRecord["type"],
): ArtifactRecord {
  return {
    id,
    lessonId,
    type,
    title: type,
    content: "artifact content",
    createdAt: "2025-01-01T00:00:00.000Z",
  };
}

describe("buildIndependentReadinessSummary", () => {
  it("returns not-started when phase four has no progress", () => {
    const summary = buildIndependentReadinessSummary(
      curriculum,
      {},
      {},
      {},
      [],
    );

    expect(summary?.statusLabel).toBe("not-started");
    expect(summary?.unmetChecks).toContain("Core independent builds complete");
  });

  it("returns capstone-ready when core work is complete but capstone is not", () => {
    const summary = buildIndependentReadinessSummary(
      curriculum,
      Object.fromEntries(coreLessons.map((lesson) => [lesson.id, true])),
      { "lesson-cli-build": true },
      {
        DeliveryWorkflow: 12,
        Testing: 8,
        Debugging: 12,
        ApiIntegration: 8,
      },
      [
        buildArtifact("a1", coreLessons[0].id, "note"),
        buildArtifact("a2", coreLessons[1].id, "reflection"),
      ],
    );

    expect(summary?.statusLabel).toBe("capstone-ready");
    expect(summary?.unmetChecks).toContain("Capstone packaged");
  });

  it("returns portfolio-ready when all phase four requirements are met", () => {
    const summary = buildIndependentReadinessSummary(
      curriculum,
      Object.fromEntries(phaseFourLessons.map((lesson) => [lesson.id, true])),
      { "lesson-cli-build": true },
      {
        DeliveryWorkflow: 12,
        Testing: 8,
        Debugging: 12,
        ApiIntegration: 8,
      },
      [
        buildArtifact("a1", coreLessons[0].id, "note"),
        buildArtifact("a2", capstoneLessons[0].id, "reflection"),
      ],
    );

    expect(summary?.statusLabel).toBe("portfolio-ready");
    expect(summary?.readinessPercent).toBe(100);
    expect(summary?.unmetChecks).toHaveLength(0);
  });
});
