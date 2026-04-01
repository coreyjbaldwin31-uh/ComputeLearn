import type { LabInstance } from "@/lib/lab-engine";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLabLifecycle } from "./hooks/use-lab-lifecycle";

const noopArtifact = vi.fn();

function setup(lessonId?: string, instances: Record<string, LabInstance> = {}) {
  const setLabInstances = vi.fn();
  const result = renderHook(() =>
    useLabLifecycle(lessonId, instances, setLabInstances, noopArtifact),
  );
  return { ...result, setLabInstances };
}

describe("useLabLifecycle", () => {
  it("returns null template when no lesson selected", () => {
    const { result } = setup(undefined);
    expect(result.current.currentLabTemplate).toBeNull();
    expect(result.current.currentLabInstance).toBeNull();
  });

  it("returns null template for lesson without labs", () => {
    const { result } = setup("nonexistent-lesson-id");
    expect(result.current.currentLabTemplate).toBeNull();
  });

  it("returns a template for a lesson with labs", () => {
    const { result } = setup("lesson-filesystem");
    expect(result.current.currentLabTemplate).not.toBeNull();
    expect(result.current.currentLabTemplate!.id).toBeTruthy();
  });

  it("startLab calls setLabInstances when template exists", () => {
    const { result, setLabInstances } = setup("lesson-filesystem");
    act(() => {
      result.current.startLab();
    });
    expect(setLabInstances).toHaveBeenCalledTimes(1);
  });

  it("startLab does nothing when no template", () => {
    const { result, setLabInstances } = setup("nonexistent-lesson");
    act(() => {
      result.current.startLab();
    });
    expect(setLabInstances).not.toHaveBeenCalled();
  });

  it("validateLab returns null when no instance exists", () => {
    const { result } = setup("lesson-filesystem");
    let validationResult: unknown;
    act(() => {
      validationResult = result.current.validateLab();
    });
    expect(validationResult).toBeNull();
  });

  it("resetCurrentLab does nothing when no instance", () => {
    const { result, setLabInstances } = setup("lesson-filesystem");
    act(() => {
      result.current.resetCurrentLab();
    });
    expect(setLabInstances).not.toHaveBeenCalled();
  });

  it("labCompletionSummary is null when no completed instance", () => {
    const { result } = setup("lesson-filesystem");
    expect(result.current.labCompletionSummary).toBeNull();
  });

  it("labTerminalFilesystem is defined when template exists", () => {
    const { result } = setup("lesson-filesystem");
    expect(result.current.labTerminalFilesystem).toBeDefined();
  });

  it("labTerminalFilesystem is undefined when no template", () => {
    const { result } = setup("nonexistent-lesson");
    expect(result.current.labTerminalFilesystem).toBeUndefined();
  });

  it("labFileContents is undefined when no instance", () => {
    const { result } = setup("lesson-filesystem");
    expect(result.current.labFileContents).toBeUndefined();
  });
});
