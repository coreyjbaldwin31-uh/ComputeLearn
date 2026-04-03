"use client";

type StorageSurfaceChipProps = {
  label: string;
  mode: "stable" | "degraded" | "recovered";
  lastSuccessfulSaveLabel: string | null;
  isSaveStale: boolean;
  isDirty: boolean;
  onOpenRecovery: () => void;
};

export function StorageSurfaceChip({
  label,
  mode,
  lastSuccessfulSaveLabel,
  isSaveStale,
  isDirty,
  onOpenRecovery,
}: StorageSurfaceChipProps) {
  const descriptor =
    mode === "degraded"
      ? "degraded"
      : mode === "recovered"
        ? "recovered"
        : isSaveStale
          ? "stale"
          : "healthy";

  const statusText =
    mode === "degraded"
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
      {(mode === "degraded" || isSaveStale) && (
        <button type="button" className="chip-link" onClick={onOpenRecovery}>
          Recovery
        </button>
      )}
    </div>
  );
}
