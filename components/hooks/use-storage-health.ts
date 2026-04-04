"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StorageRecoveryLogEntry } from "../storage-recovery-log";
import { learnerProfileStorageKey } from "./use-learner-profile";

/* ---- Well-known storage keys (must match useLocalStorageState consumers) ---- */

const notesStorageKey = "computelearn-notes";
const reflectionsStorageKey = "computelearn-reflections";

/* ---- Event detail types (mirrors useLocalStorageState dispatch shapes) ---- */

type LocalStorageWriteErrorDetail = {
  key: string;
  message: string;
  raw: string | null;
};

type LocalStorageWriteDetail = {
  key: string;
};

/* ---- Public types ---- */

export type StorageHealthMode = "stable" | "degraded" | "recovered";

export type SurfaceFailureState = {
  count: number;
  message: string | null;
};

export type StorageHealthState = {
  /** Overall persistence health. */
  mode: StorageHealthMode;
  /** User-facing error flash message (auto-clears after 4.5 s). */
  errorFlash: string | null;
  /** System-level flash (recovery confirmations — auto-clears after 2.2 s). */
  systemFlash: string | null;
  /** Number of consecutive storage write errors. */
  errorCount: number;
  /** Key that last failed to write. */
  lastFailureKey: string | null;
  /** Human-readable last-save label ("just now", "12s ago", …). */
  lastSuccessfulSaveLabel: string | null;
  /** True when the last successful save exceeds the staleness threshold. */
  isSaveStale: boolean;
  /** Per-key dirty indicators. */
  noteDirty: boolean;
  reflectionDirty: boolean;
  profileDirty: boolean;
  /** Per-key failure counts and messages. */
  surfaceFailures: Record<string, SurfaceFailureState>;
  /** Recent recovery-log entries (max 3). */
  recoveryLog: StorageRecoveryLogEntry[];
  /** Whether the recovery dialog should be shown. */
  showRecoveryDialog: boolean;
};

export type StorageHealthActions = {
  /** Mark the notes surface as dirty (call on every note edit). */
  markNoteDirty: () => void;
  /** Mark the reflection surface as dirty. */
  markReflectionDirty: () => void;
  /** Mark the learner-profile surface as dirty. */
  markProfileDirty: () => void;
  /** Retry the last failed localStorage write. */
  retryFailedWrite: () => void;
  /** Export artifacts and log a backup entry. */
  exportRecoveryBackup: () => void;
  /** Reset all local data and clear degraded state. */
  resetAfterFailure: () => void;
  /** Open the recovery dialog. */
  openRecoveryDialog: () => void;
  /** Close the recovery dialog. */
  closeRecoveryDialog: () => void;
  /** Dismiss a "recovered" banner back to "stable". */
  dismissRecovered: () => void;
};

/* ---- Constants ---- */

const STALE_SAVE_THRESHOLD_MS = 90_000;
const CLOCK_INTERVAL_MS = 15_000;
const ERROR_FLASH_DURATION_MS = 4_500;
const SYSTEM_FLASH_DURATION_MS = 2_200;
const HEALTH_RECOVERY_DURATION_MS = 7_000;

/* ---- Hook ---- */

type UseStorageHealthOptions = {
  /** Called when the user requests an artifact backup export. */
  onExportArtifacts: () => void;
  /** Called when the user requests a full local-data reset. */
  onResetAllProgress: () => void;
};

export function useStorageHealth({
  onExportArtifacts,
  onResetAllProgress,
}: UseStorageHealthOptions): [StorageHealthState, StorageHealthActions] {
  /* ---- Stable callback refs (avoids stale closures) ---- */
  const exportRef = useRef(onExportArtifacts);
  const resetRef = useRef(onResetAllProgress);
  useEffect(() => {
    exportRef.current = onExportArtifacts;
    resetRef.current = onResetAllProgress;
  });

  /* ---- Core state ---- */
  const [mode, setMode] = useState<StorageHealthMode>("stable");
  const [errorFlash, setErrorFlash] = useState<string | null>(null);
  const [lastError, setLastError] =
    useState<LocalStorageWriteErrorDetail | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [systemFlash, setSystemFlash] = useState<string | null>(null);
  const [lastFailureKey, setLastFailureKey] = useState<string | null>(null);
  const [lastSuccessfulSaveAt, setLastSuccessfulSaveAt] = useState<
    number | null
  >(null);
  const [noteDirty, setNoteDirty] = useState(false);
  const [reflectionDirty, setReflectionDirty] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);
  const [surfaceFailures, setSurfaceFailures] = useState<
    Record<string, SurfaceFailureState>
  >({});
  const [recoveryLog, setRecoveryLog] = useState<StorageRecoveryLogEntry[]>([]);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [saveClockTick, setSaveClockTick] = useState(() => Date.now());

  /* ---- Refs for timers ---- */
  const errorTimerRef = useRef<number | null>(null);
  const systemFlashTimerRef = useRef<number | null>(null);
  const healthTimerRef = useRef<number | null>(null);

  /* ---- Helpers ---- */

  const getNowLabel = useCallback(() => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  const pushRecoveryLog = useCallback(
    (entry: Omit<StorageRecoveryLogEntry, "id" | "atLabel">) => {
      const next: StorageRecoveryLogEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        atLabel: getNowLabel(),
      };
      setRecoveryLog((current) => [next, ...current].slice(0, 3));
    },
    [getNowLabel],
  );

  const flashSystem = useCallback((message: string) => {
    setSystemFlash(message);
    if (systemFlashTimerRef.current != null) {
      window.clearTimeout(systemFlashTimerRef.current);
    }
    systemFlashTimerRef.current = window.setTimeout(() => {
      setSystemFlash(null);
    }, SYSTEM_FLASH_DURATION_MS);
  }, []);

  const scheduleHealthRecovery = useCallback(() => {
    if (healthTimerRef.current != null) {
      window.clearTimeout(healthTimerRef.current);
    }
    healthTimerRef.current = window.setTimeout(() => {
      setMode("stable");
    }, HEALTH_RECOVERY_DURATION_MS);
  }, []);

  /* ---- Write-success listener ---- */

  useEffect(() => {
    function handleWriteSuccess(event: Event) {
      const detail = (event as CustomEvent<LocalStorageWriteDetail>).detail;
      if (detail?.key) {
        setSurfaceFailures((current) => {
          if (!current[detail.key]) return current;
          const next = { ...current };
          delete next[detail.key];
          return next;
        });
      }

      if (detail?.key === notesStorageKey) setNoteDirty(false);
      if (detail?.key === reflectionsStorageKey) setReflectionDirty(false);
      if (detail?.key === learnerProfileStorageKey) setProfileDirty(false);

      const now = Date.now();
      setLastSuccessfulSaveAt(now);
      setSaveClockTick(now);

      setMode((current) => (current === "degraded" ? "recovered" : current));
      setErrorFlash(null);
      setLastError(null);
      setErrorCount(0);
      setLastFailureKey(null);

      scheduleHealthRecovery();
    }

    window.addEventListener("ls-write", handleWriteSuccess);
    return () => {
      window.removeEventListener("ls-write", handleWriteSuccess);
    };
  }, [scheduleHealthRecovery]);

  /* ---- Write-error listener ---- */

  useEffect(() => {
    function handleWriteError(event: Event) {
      const detail = (event as CustomEvent<LocalStorageWriteErrorDetail>)
        .detail;

      if (detail?.key) {
        setSurfaceFailures((current) => ({
          ...current,
          [detail.key]: {
            count: (current[detail.key]?.count ?? 0) + 1,
            message: detail.message ?? "Storage write failed",
          },
        }));

        pushRecoveryLog({
          key: detail.key,
          outcome: "error",
          message: detail.message ?? "Storage write failed",
        });
      }

      setLastError(detail ?? null);
      setErrorCount((current) => current + 1);
      setMode("degraded");
      setLastFailureKey(detail?.key ?? null);

      const context = detail?.key ? ` (${detail.key})` : "";
      const message = detail?.message ?? "Storage write failed";
      setErrorFlash(
        `Could not save your latest changes${context}. ${message}. Retry after checking browser storage settings and free space.`,
      );

      if (errorTimerRef.current != null) {
        window.clearTimeout(errorTimerRef.current);
      }
      errorTimerRef.current = window.setTimeout(() => {
        setErrorFlash(null);
      }, ERROR_FLASH_DURATION_MS);
    }

    window.addEventListener("ls-write-error", handleWriteError);

    return () => {
      window.removeEventListener("ls-write-error", handleWriteError);
      if (errorTimerRef.current != null) {
        window.clearTimeout(errorTimerRef.current);
      }
      if (systemFlashTimerRef.current != null) {
        window.clearTimeout(systemFlashTimerRef.current);
      }
      if (healthTimerRef.current != null) {
        window.clearTimeout(healthTimerRef.current);
      }
    };
  }, [pushRecoveryLog]);

  /* ---- Save-freshness clock ---- */

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSaveClockTick(Date.now());
    }, CLOCK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  /* ---- Derived values ---- */

  const lastSuccessfulSaveLabel = useMemo(() => {
    if (!lastSuccessfulSaveAt) return null;

    const deltaMs = Math.max(0, saveClockTick - lastSuccessfulSaveAt);
    const deltaSeconds = Math.floor(deltaMs / 1000);

    if (deltaSeconds < 8) return "just now";
    if (deltaSeconds < 60) return `${deltaSeconds}s ago`;

    const deltaMinutes = Math.floor(deltaSeconds / 60);
    if (deltaMinutes < 60) return `${deltaMinutes}m ago`;

    return `${Math.floor(deltaMinutes / 60)}h ago`;
  }, [lastSuccessfulSaveAt, saveClockTick]);

  const isSaveStale = useMemo(() => {
    if (!lastSuccessfulSaveAt) return false;
    return saveClockTick - lastSuccessfulSaveAt >= STALE_SAVE_THRESHOLD_MS;
  }, [lastSuccessfulSaveAt, saveClockTick]);

  /* ---- Actions ---- */

  const retryFailedWrite = useCallback(() => {
    if (!lastError?.key || lastError.raw == null) return;

    try {
      localStorage.setItem(lastError.key, lastError.raw);
      window.dispatchEvent(
        new CustomEvent("ls-write", {
          detail: { key: lastError.key } satisfies LocalStorageWriteDetail,
        }),
      );
      setErrorFlash(null);
      setLastError(null);
      setErrorCount(0);
      setMode("recovered");
      setLastFailureKey(null);
      flashSystem("Save recovered successfully");
      pushRecoveryLog({
        key: lastError.key,
        outcome: "retry-success",
        message: "Retry save succeeded",
      });
      scheduleHealthRecovery();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Storage write failed";
      pushRecoveryLog({
        key: lastError.key,
        outcome: "retry-failed",
        message,
      });
      setErrorFlash(`Retry failed for ${lastError.key}. ${message}.`);
    }
  }, [lastError, flashSystem, pushRecoveryLog, scheduleHealthRecovery]);

  const exportRecoveryBackup = useCallback(() => {
    exportRef.current();
    pushRecoveryLog({
      key: null,
      outcome: "backup-exported",
      message: "Artifact backup exported",
    });
    flashSystem("Artifact backup exported");
    setShowRecoveryDialog(false);
  }, [pushRecoveryLog, flashSystem]);

  const resetAfterFailure = useCallback(() => {
    resetRef.current();
    setErrorFlash(null);
    setLastError(null);
    setErrorCount(0);
    setMode("stable");
    setLastFailureKey(null);
    setNoteDirty(false);
    setReflectionDirty(false);
    setProfileDirty(false);
    setSurfaceFailures({});
    pushRecoveryLog({
      key: null,
      outcome: "local-reset",
      message: "Local learning data reset",
    });
    flashSystem("Local learning data reset");
    setShowRecoveryDialog(false);
  }, [pushRecoveryLog, flashSystem]);

  /* ---- Assemble return ---- */

  const state: StorageHealthState = {
    mode,
    errorFlash,
    systemFlash,
    errorCount,
    lastFailureKey,
    lastSuccessfulSaveLabel,
    isSaveStale,
    noteDirty,
    reflectionDirty,
    profileDirty,
    surfaceFailures,
    recoveryLog,
    showRecoveryDialog,
  };

  const actions: StorageHealthActions = {
    markNoteDirty: useCallback(() => setNoteDirty(true), []),
    markReflectionDirty: useCallback(() => setReflectionDirty(true), []),
    markProfileDirty: useCallback(() => setProfileDirty(true), []),
    retryFailedWrite,
    exportRecoveryBackup,
    resetAfterFailure,
    openRecoveryDialog: useCallback(() => setShowRecoveryDialog(true), []),
    closeRecoveryDialog: useCallback(() => setShowRecoveryDialog(false), []),
    dismissRecovered: useCallback(() => setMode("stable"), []),
  };

  return [state, actions];
}
