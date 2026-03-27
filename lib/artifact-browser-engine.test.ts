import { describe, expect, it } from "vitest";
import {
    buildArtifactBrowserSummary,
    getArtifactPreview,
} from "./artifact-browser-engine";

describe("buildArtifactBrowserSummary", () => {
  const artifacts = [
    {
      id: "a1",
      lessonId: "l1",
      type: "note" as const,
      title: "Note",
      content: "First note",
      createdAt: "2026-04-01T00:00:00.000Z",
    },
    {
      id: "a2",
      lessonId: "l1",
      type: "reflection" as const,
      title: "Reflection",
      content: "Reflection content",
      createdAt: "2026-04-02T00:00:00.000Z",
    },
    {
      id: "a3",
      lessonId: "l2",
      type: "transfer" as const,
      title: "Transfer",
      content: "Transfer content",
      createdAt: "2026-04-03T00:00:00.000Z",
    },
  ];

  it("filters to a lesson and counts artifact types", () => {
    const summary = buildArtifactBrowserSummary(artifacts, "l1");

    expect(summary.total).toBe(2);
    expect(summary.counts.note).toBe(1);
    expect(summary.counts.reflection).toBe(1);
    expect(summary.counts.transfer).toBe(0);
  });

  it("sorts recent artifacts newest first", () => {
    const summary = buildArtifactBrowserSummary(artifacts);
    expect(summary.recent[0].id).toBe("a3");
  });
});

describe("getArtifactPreview", () => {
  it("returns normalized text when it is short", () => {
    expect(getArtifactPreview("A  short\nvalue")).toBe("A short value");
  });

  it("truncates long text with an ellipsis", () => {
    const preview = getArtifactPreview("x".repeat(120), 20);
    expect(preview).toHaveLength(20);
    expect(preview.endsWith("…")).toBe(true);
  });
});
