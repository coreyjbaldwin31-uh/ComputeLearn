"use client";

type StorageSurfaceChipProps = {
  label: string;
  mode: "stable" | "degraded" | "recovered";
  lastSuccessfulSaveLabel: string | null;
  isSaveStale: boolean;
  isDirty: boolean;
  failedCount: number;
  lastErrorReason: string | null;
  onOpenRecovery: () => void;
};

export function StorageSurfaceChip({
  label,
  mode,
  lastSuccessfulSaveLabel,
  isSaveStale,
  isDirty,
  failedCount,
  lastErrorReason,
  onOpenRecovery,
}: StorageSurfaceChipProps) {
  const hasFailure = failedCount > 0;

  const descriptor =
    mode === "degraded" && hasFailure
      ? "degraded"
      : mode === "recovered"
        ? "recovered"
        : isSaveStale
          ? "stale"
          : "healthy";

  const statusText =
    mode === "degraded" && hasFailure
      ? isDirty
        ? "Pending write"
        : "Save issue"
      : mode === "recovered"
        ? "Recovered"
        : isDirty
          ? "Saving..."
          : isSaveStale
            ? "Needs attention"
            : "Healthy";

  return (
    <div className={`storage-surface-chip storage-surface-chip--${descriptor}`}>
      <span className="storage-surface-chip-label">{label}</span>
      <span className="storage-surface-chip-value">{statusText}</span>
      {lastSuccessfulSaveLabel ? (
        <span className="storage-surface-chip-time">
          Last save: {lastSuccessfulSaveLabel}
        </span>
      ) : null}
      {mode === "degraded" && hasFailure ? (
        <span className="storage-surface-chip-error">
          {failedCount} failed attempt{failedCount === 1 ? "" : "s"}
          {lastErrorReason ? ` - ${lastErrorReason}` : ""}
        </span>
      ) : null}
      {((mode === "degraded" && hasFailure) || isSaveStale) && (
        <button type="button" className="chip-link" onClick={onOpenRecovery}>
          Recovery
        </button>
      )}
    </div>
  );
}
