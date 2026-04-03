import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { useLearnerProfile } from "./hooks/use-learner-profile";

const PROFILE_KEY = "computelearn-learner-profile";

describe("useLearnerProfile", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns empty profile by default", () => {
    const { result } = renderHook(() => useLearnerProfile());
    expect(result.current.profile.displayName).toBe("");
    expect(result.current.profile.goal).toBe("");
    expect(result.current.profile.weeklyHours).toBe(4);
    expect(result.current.profile.createdAt).toBeNull();
  });

  it("reads stored profile from localStorage", () => {
    const stored = {
      displayName: "Alice",
      goal: "Learn coding",
      weeklyHours: 8,
      createdAt: "2025-01-01T00:00:00.000Z",
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(stored));
    const { result } = renderHook(() => useLearnerProfile());
    expect(result.current.profile.displayName).toBe("Alice");
    expect(result.current.profile.goal).toBe("Learn coding");
    expect(result.current.profile.weeklyHours).toBe(8);
  });

  it("update merges partial changes into profile", () => {
    const { result } = renderHook(() => useLearnerProfile());
    act(() => {
      result.current.update({ displayName: "Bob" });
    });
    expect(result.current.profile.displayName).toBe("Bob");
    expect(result.current.profile.weeklyHours).toBe(4);
  });

  it("update sets createdAt on first update", () => {
    const { result } = renderHook(() => useLearnerProfile());
    act(() => {
      result.current.update({ displayName: "Carol" });
    });
    expect(result.current.profile.createdAt).not.toBeNull();
  });

  it("update preserves existing createdAt", () => {
    const stored = {
      displayName: "Dan",
      goal: "",
      weeklyHours: 4,
      createdAt: "2025-01-01T00:00:00.000Z",
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(stored));
    const { result } = renderHook(() => useLearnerProfile());
    act(() => {
      result.current.update({ goal: "Build apps" });
    });
    expect(result.current.profile.createdAt).toBe("2025-01-01T00:00:00.000Z");
    expect(result.current.profile.goal).toBe("Build apps");
  });

  it("persists profile to localStorage", () => {
    const { result } = renderHook(() => useLearnerProfile());
    act(() => {
      result.current.update({ displayName: "Eve", weeklyHours: 10 });
    });
    const stored = JSON.parse(localStorage.getItem(PROFILE_KEY)!);
    expect(stored.displayName).toBe("Eve");
    expect(stored.weeklyHours).toBe(10);
  });

  it("update handles multiple sequential updates", () => {
    const { result } = renderHook(() => useLearnerProfile());
    act(() => {
      result.current.update({ displayName: "Frank" });
    });
    act(() => {
      result.current.update({ goal: "Ship software" });
    });
    expect(result.current.profile.displayName).toBe("Frank");
    expect(result.current.profile.goal).toBe("Ship software");
  });

  it("dispatches ls-write-error when profile write fails", () => {
    const listener = vi.fn();
    window.addEventListener("ls-write-error", listener);
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("Storage blocked", "SecurityError");
      });

    const { result } = renderHook(() => useLearnerProfile());

    act(() => {
      result.current.update({ displayName: "Blocked" });
    });

    expect(listener).toHaveBeenCalledTimes(1);
    const customEvent = listener.mock.calls[0]?.[0] as CustomEvent<{
      key: string;
      message: string;
    }>;
    expect(customEvent.detail.key).toBe(PROFILE_KEY);
    expect(customEvent.detail.message).toBe("Storage write failed");
    expect(result.current.profile.displayName).toBe("");

    window.removeEventListener("ls-write-error", listener);
    setItemSpy.mockRestore();
  });
});
