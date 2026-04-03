"use client";

type StorageHealthBannerProps = {
  mode: "stable" | "degraded" | "recovered";
  failureCount: number;
  lastFailureKey: string | null;
  lastSuccessfulSaveLabel: string | null;
  isSaveStale: boolean;
  onOpenRecovery: () => void;
  onDismissRecovered: () => void;
};

export function StorageHealthBanner({
  mode,
  failureCount,
  lastFailureKey,
  lastSuccessfulSaveLabel,
  isSaveStale,
  onOpenRecovery,
  onDismissRecovered,
}: StorageHealthBannerProps) {
  if (mode === "stable") {
    if (!lastSuccessfulSaveLabel) {
      return null;
    }

    return (
      <section
        className={`storage-health-banner storage-health-banner--stable${isSaveStale ? " storage-health-banner--stale" : ""}`}
        role="status"
        aria-live="polite"
      >
        <div className="storage-health-content">
          <strong>
            {isSaveStale
              ? "Save freshness needs attention"
              : "Save reliability healthy"}
          </strong>
          <span>
            Last successful save: {lastSuccessfulSaveLabel}
            {isSaveStale
              ? ". Open recovery options if saving appears delayed."
              : "."}
          </span>
        </div>
        {isSaveStale ? (
          <button
            type="button"
            className="ghost-button"
            onClick={onOpenRecovery}
          >
            Recovery options
          </button>
        ) : null}
      </section>
    );
  }

  if (mode === "degraded") {
    return (
      <section
        className="storage-health-banner storage-health-banner--degraded"
        role="status"
        aria-live="polite"
      >
        <div className="storage-health-content">
          <strong>Save reliability is degraded</strong>
          <span>
            {failureCount} save attempt{failureCount !== 1 ? "s" : ""} failed
            {lastFailureKey ? ` for ${lastFailureKey}` : ""}. Use recovery
            options to protect your work.
            {lastSuccessfulSaveLabel
              ? ` Last successful save: ${lastSuccessfulSaveLabel}.`
              : ""}
          </span>
        </div>
        <button type="button" className="ghost-button" onClick={onOpenRecovery}>
          Recovery options
        </button>
      </section>
    );
  }

  return (
    <section
      className="storage-health-banner storage-health-banner--recovered"
      role="status"
      aria-live="polite"
    >
      <div className="storage-health-content">
        <strong>Save reliability recovered</strong>
        <span>
          Your latest changes are saving again.
          {lastSuccessfulSaveLabel
            ? ` Last successful save: ${lastSuccessfulSaveLabel}.`
            : ""}
        </span>
      </div>
      <button
        type="button"
        className="ghost-button"
        onClick={onDismissRecovered}
      >
        Dismiss
      </button>
    </section>
  );
}
