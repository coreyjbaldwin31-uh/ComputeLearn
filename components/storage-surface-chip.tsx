"use client";

type StorageSurfaceChipProps = {
  label: string;
  mode: "stable" | "degraded" | "recovered";
  lastSuccessfulSaveLabel: string | null;
  isSaveStale: boolean;
  onOpenRecovery: () => void;
};

export function StorageSurfaceChip({
  label,
  mode,
  lastSuccessfulSaveLabel,
  isSaveStale,
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

  return (
    <div className={`storage-surface-chip storage-surface-chip--${descriptor}`}>
      <span className="storage-surface-chip-label">{label}</span>
      <span className="storage-surface-chip-value">
        {mode === "degraded"
          ? "Save issue"
          : mode === "recovered"
            ? "Recovered"
            : isSaveStale
              ? "Needs attention"
              : "Healthy"}
      </span>
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
