import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { useStorageHealth } from "./hooks/use-storage-health";

function makeOptions(overrides: Record<string, unknown> = {}) {
  return {
    onExportArtifacts: vi.fn(),
    onResetAllProgress: vi.fn(),
    ...overrides,
  };
}

function fireWriteSuccess(key: string) {
  window.dispatchEvent(
    new CustomEvent("ls-write", { detail: { key } }),
  );
}

function fireWriteError(
  key: string,
  message = "QuotaExceededError",
  raw: string | null = '{"data":true}',
) {
  window.dispatchEvent(
    new CustomEvent("ls-write-error", { detail: { key, message, raw } }),
  );
}

describe("useStorageHealth", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("returns initial stable state", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));
    const [state] = result.current;

    expect(state.mode).toBe("stable");
    expect(state.errorFlash).toBeNull();
    expect(state.systemFlash).toBeNull();
    expect(state.errorCount).toBe(0);
    expect(state.lastFailureKey).toBeNull();
    expect(state.lastSuccessfulSaveLabel).toBeNull();
    expect(state.isSaveStale).toBe(false);
    expect(state.noteDirty).toBe(false);
    expect(state.reflectionDirty).toBe(false);
    expect(state.profileDirty).toBe(false);
    expect(state.surfaceFailures).toEqual({});
    expect(state.recoveryLog).toEqual([]);
    expect(state.showRecoveryDialog).toBe(false);
  });

  it("exposes expected action methods", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));
    const [, actions] = result.current;

    expect(typeof actions.markNoteDirty).toBe("function");
    expect(typeof actions.markReflectionDirty).toBe("function");
    expect(typeof actions.markProfileDirty).toBe("function");
    expect(typeof actions.retryFailedWrite).toBe("function");
    expect(typeof actions.exportRecoveryBackup).toBe("function");
    expect(typeof actions.resetAfterFailure).toBe("function");
    expect(typeof actions.openRecoveryDialog).toBe("function");
    expect(typeof actions.closeRecoveryDialog).toBe("function");
    expect(typeof actions.dismissRecovered).toBe("function");
  });

  it("transitions to degraded mode on write error", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteError("computelearn-notes");
    });

    const [state] = result.current;
    expect(state.mode).toBe("degraded");
    expect(state.errorCount).toBe(1);
    expect(state.lastFailureKey).toBe("computelearn-notes");
    expect(state.errorFlash).toContain("Could not save");
    expect(state.surfaceFailures["computelearn-notes"]).toBeDefined();
    expect(state.surfaceFailures["computelearn-notes"].count).toBe(1);
  });

  it("accumulates multiple errors for the same key", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteError("computelearn-notes");
      fireWriteError("computelearn-notes");
    });

    const [state] = result.current;
    expect(state.errorCount).toBe(2);
    expect(state.surfaceFailures["computelearn-notes"].count).toBe(2);
  });

  it("transitions to recovered on successful write after error", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteError("computelearn-notes");
    });
    expect(result.current[0].mode).toBe("degraded");

    act(() => {
      fireWriteSuccess("computelearn-notes");
    });

    const [state] = result.current;
    expect(state.mode).toBe("recovered");
    expect(state.errorCount).toBe(0);
    expect(state.errorFlash).toBeNull();
    expect(state.lastFailureKey).toBeNull();
    expect(state.surfaceFailures["computelearn-notes"]).toBeUndefined();
  });

  it("clears dirty flags on successful writes for matching keys", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      result.current[1].markNoteDirty();
      result.current[1].markReflectionDirty();
      result.current[1].markProfileDirty();
    });

    expect(result.current[0].noteDirty).toBe(true);
    expect(result.current[0].reflectionDirty).toBe(true);
    expect(result.current[0].profileDirty).toBe(true);

    act(() => {
      fireWriteSuccess("computelearn-notes");
    });

    expect(result.current[0].noteDirty).toBe(false);
    expect(result.current[0].reflectionDirty).toBe(true);
    expect(result.current[0].profileDirty).toBe(true);

    act(() => {
      fireWriteSuccess("computelearn-reflections");
    });
    expect(result.current[0].reflectionDirty).toBe(false);

    act(() => {
      fireWriteSuccess("computelearn-learner-profile");
    });
    expect(result.current[0].profileDirty).toBe(false);
  });

  it("produces a recovery log on write errors", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteError("computelearn-notes", "QuotaExceededError");
    });

    const [state] = result.current;
    expect(state.recoveryLog).toHaveLength(1);
    expect(state.recoveryLog[0].outcome).toBe("error");
    expect(state.recoveryLog[0].key).toBe("computelearn-notes");
    expect(state.recoveryLog[0].id).toBeTruthy();
    expect(state.recoveryLog[0].atLabel).toBeTruthy();
  });

  it("keeps at most 3 recovery log entries", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteError("key-a", "err1");
      fireWriteError("key-b", "err2");
      fireWriteError("key-c", "err3");
      fireWriteError("key-d", "err4");
    });

    expect(result.current[0].recoveryLog).toHaveLength(3);
    // Most recent first
    expect(result.current[0].recoveryLog[0].key).toBe("key-d");
  });

  it("retryFailedWrite succeeds when localStorage works", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteError("computelearn-notes", "QuotaExceededError", '{"test":1}');
    });
    expect(result.current[0].mode).toBe("degraded");

    act(() => {
      result.current[1].retryFailedWrite();
    });

    const [state] = result.current;
    expect(state.mode).toBe("recovered");
    expect(state.errorFlash).toBeNull();
    expect(state.errorCount).toBe(0);
    expect(state.systemFlash).toBe("Save recovered successfully");
    expect(localStorage.getItem("computelearn-notes")).toBe('{"test":1}');
  });

  it("retryFailedWrite logs failure when localStorage throws", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteError("computelearn-notes", "QuotaExceededError", '{"test":1}');
    });

    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Blocked by policy");
      });

    act(() => {
      result.current[1].retryFailedWrite();
    });

    const [state] = result.current;
    expect(state.mode).toBe("degraded");
    expect(state.errorFlash).toContain("Retry failed");
    // Error + original + retry fail = at least 2 log entries
    expect(
      state.recoveryLog.some((e) => e.outcome === "retry-failed"),
    ).toBe(true);

    setItemSpy.mockRestore();
  });

  it("retryFailedWrite does nothing when no prior error exists", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      result.current[1].retryFailedWrite();
    });

    expect(result.current[0].mode).toBe("stable");
  });

  it("exportRecoveryBackup calls onExportArtifacts and logs entry", () => {
    const opts = makeOptions();
    const { result } = renderHook(() => useStorageHealth(opts));

    act(() => {
      result.current[1].openRecoveryDialog();
    });
    expect(result.current[0].showRecoveryDialog).toBe(true);

    act(() => {
      result.current[1].exportRecoveryBackup();
    });

    expect(opts.onExportArtifacts).toHaveBeenCalledOnce();
    expect(result.current[0].showRecoveryDialog).toBe(false);
    expect(result.current[0].systemFlash).toBe("Artifact backup exported");
    expect(
      result.current[0].recoveryLog.some(
        (e) => e.outcome === "backup-exported",
      ),
    ).toBe(true);
  });

  it("resetAfterFailure calls onResetAllProgress and clears state", () => {
    const opts = makeOptions();
    const { result } = renderHook(() => useStorageHealth(opts));

    // Put hook into degraded state first
    act(() => {
      fireWriteError("computelearn-notes");
      result.current[1].markNoteDirty();
      result.current[1].openRecoveryDialog();
    });
    expect(result.current[0].mode).toBe("degraded");

    act(() => {
      result.current[1].resetAfterFailure();
    });

    expect(opts.onResetAllProgress).toHaveBeenCalledOnce();
    const [state] = result.current;
    expect(state.mode).toBe("stable");
    expect(state.errorFlash).toBeNull();
    expect(state.errorCount).toBe(0);
    expect(state.noteDirty).toBe(false);
    expect(state.surfaceFailures).toEqual({});
    expect(state.showRecoveryDialog).toBe(false);
    expect(state.systemFlash).toBe("Local learning data reset");
  });

  it("auto-clears errorFlash after timeout", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteError("computelearn-notes");
    });
    expect(result.current[0].errorFlash).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(4_500);
    });
    expect(result.current[0].errorFlash).toBeNull();
  });

  it("auto-clears systemFlash after timeout", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    // Trigger a retry success to get a systemFlash
    act(() => {
      fireWriteError("computelearn-notes", "err", '{"x":1}');
    });
    act(() => {
      result.current[1].retryFailedWrite();
    });
    expect(result.current[0].systemFlash).toBe("Save recovered successfully");

    act(() => {
      vi.advanceTimersByTime(2_200);
    });
    expect(result.current[0].systemFlash).toBeNull();
  });

  it("returns to stable from recovered after health recovery timeout", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteError("computelearn-notes");
    });
    act(() => {
      fireWriteSuccess("computelearn-notes");
    });
    expect(result.current[0].mode).toBe("recovered");

    act(() => {
      vi.advanceTimersByTime(7_000);
    });
    expect(result.current[0].mode).toBe("stable");
  });

  it("dismissRecovered transitions from recovered to stable", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteError("computelearn-notes");
    });
    act(() => {
      fireWriteSuccess("computelearn-notes");
    });
    expect(result.current[0].mode).toBe("recovered");

    act(() => {
      result.current[1].dismissRecovered();
    });
    expect(result.current[0].mode).toBe("stable");
  });

  it("computes lastSuccessfulSaveLabel as 'just now' immediately after write", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteSuccess("computelearn-notes");
    });

    expect(result.current[0].lastSuccessfulSaveLabel).toBe("just now");
  });

  it("computes stale save when threshold exceeded", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      fireWriteSuccess("computelearn-notes");
    });
    expect(result.current[0].isSaveStale).toBe(false);

    // Advance past staleness threshold (90s)
    act(() => {
      vi.advanceTimersByTime(90_000);
    });
    expect(result.current[0].isSaveStale).toBe(true);
  });

  it("opens and closes recovery dialog", () => {
    const { result } = renderHook(() => useStorageHealth(makeOptions()));

    act(() => {
      result.current[1].openRecoveryDialog();
    });
    expect(result.current[0].showRecoveryDialog).toBe(true);

    act(() => {
      result.current[1].closeRecoveryDialog();
    });
    expect(result.current[0].showRecoveryDialog).toBe(false);
  });
});
