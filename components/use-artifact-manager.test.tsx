import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { useArtifactManager } from "./hooks/use-artifact-manager";
import type { ArtifactRecord } from "@/lib/artifact-engine";
import type { Lesson } from "@/data/curriculum";

function makeLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: "lesson-1",
    title: "Test Lesson",
    summary: "summary",
    duration: "10 min",
    difficulty: "beginner",
    objective: "objective",
    explanation: [],
    demonstration: [],
    exerciseSteps: [],
    validationChecks: [],
    retention: [],
    tools: [],
    notesPrompt: "prompt",
    exercises: [],
    ...overrides,
  };
}

function createConfig(overrides: Record<string, unknown> = {}) {
  const setArtifacts = vi.fn();
  return {
    artifacts: [] as ArtifactRecord[],
    setArtifacts,
    notes: {} as Record<string, string>,
    reflections: {} as Record<string, string>,
    selectedLesson: makeLesson(),
    reflectionPrompts: ["What changed?"],
    selectedLessonWeakTracks: [] as string[],
    allLessonsFlat: [],
    ...overrides,
  };
}

describe("useArtifactManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns expected shape", () => {
    const config = createConfig();
    const { result } = renderHook(() => useArtifactManager(config));
    expect(result.current).toHaveProperty("addArtifact");
    expect(result.current).toHaveProperty("saveNoteArtifact");
    expect(result.current).toHaveProperty("saveReflectionArtifact");
    expect(result.current).toHaveProperty("exportArtifacts");
    expect(result.current).toHaveProperty("saveFlash");
  });

  it("addArtifact calls setArtifacts with new artifact", () => {
    const config = createConfig();
    const { result } = renderHook(() => useArtifactManager(config));
    act(() => {
      result.current.addArtifact("note", "My Note", "content", "lesson-1");
    });
    expect(config.setArtifacts).toHaveBeenCalledTimes(1);
    const updater = config.setArtifacts.mock.calls[0][0];
    const next = updater([]);
    expect(next).toHaveLength(1);
    expect(next[0].type).toBe("note");
    expect(next[0].title).toBe("My Note");
    expect(next[0].content).toBe("content");
    expect(next[0].lessonId).toBe("lesson-1");
  });

  it("addArtifact does nothing for empty content", () => {
    const config = createConfig();
    const { result } = renderHook(() => useArtifactManager(config));
    act(() => {
      result.current.addArtifact("note", "My Note", "   ", "lesson-1");
    });
    expect(config.setArtifacts).not.toHaveBeenCalled();
  });

  it("addArtifact caps at 250 artifacts", () => {
    const config = createConfig();
    const { result } = renderHook(() => useArtifactManager(config));
    act(() => {
      result.current.addArtifact("note", "title", "content", "lesson-1");
    });
    const updater = config.setArtifacts.mock.calls[0][0];
    const existing = Array.from({ length: 260 }, (_, i) => ({
      id: `a-${i}`,
      lessonId: "l",
      type: "note" as const,
      title: `t-${i}`,
      content: "c",
      createdAt: new Date().toISOString(),
    }));
    const next = updater(existing);
    expect(next.length).toBeLessThanOrEqual(250);
  });

  it("saveNoteArtifact creates a note artifact and flashes", () => {
    vi.useFakeTimers();
    const config = createConfig({ notes: { "lesson-1": "my note text" } });
    const { result } = renderHook(() => useArtifactManager(config));
    act(() => {
      result.current.saveNoteArtifact("lesson-1");
    });
    expect(config.setArtifacts).toHaveBeenCalledTimes(1);
    expect(result.current.saveFlash).toBe("Note saved ✓");
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(result.current.saveFlash).toBeNull();
    vi.useRealTimers();
  });

  it("saveReflectionArtifact creates a reflection artifact", () => {
    vi.useFakeTimers();
    const lesson = makeLesson();
    const config = createConfig({
      selectedLesson: lesson,
      reflections: { "lesson-1": "I learned a lot" },
      reflectionPrompts: ["What changed?"],
      selectedLessonWeakTracks: ["terminal"],
    });
    const { result } = renderHook(() => useArtifactManager(config));
    act(() => {
      result.current.saveReflectionArtifact("lesson-1");
    });
    expect(config.setArtifacts).toHaveBeenCalledTimes(1);
    expect(result.current.saveFlash).toBe("Reflection saved ✓");
    vi.useRealTimers();
  });

  it("saveReflectionArtifact does nothing for wrong lesson id", () => {
    const lesson = makeLesson({ id: "lesson-1" });
    const config = createConfig({ selectedLesson: lesson });
    const { result } = renderHook(() => useArtifactManager(config));
    act(() => {
      result.current.saveReflectionArtifact("lesson-other");
    });
    expect(config.setArtifacts).not.toHaveBeenCalled();
  });

  it("saveFlash starts as null", () => {
    const config = createConfig();
    const { result } = renderHook(() => useArtifactManager(config));
    expect(result.current.saveFlash).toBeNull();
  });
});
