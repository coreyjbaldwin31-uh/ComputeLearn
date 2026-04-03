"use client";

type StorageHealthBannerProps = {
  mode: "stable" | "degraded" | "recovered";
  failureCount: number;
  lastFailureKey: string | null;
  onOpenRecovery: () => void;
  onDismissRecovered: () => void;
};

export function StorageHealthBanner({
  mode,
  failureCount,
  lastFailureKey,
  onOpenRecovery,
  onDismissRecovered,
}: StorageHealthBannerProps) {
  if (mode === "stable") {
    return null;
  }

  if (mode === "degraded") {
    return (
      <section className="storage-health-banner storage-health-banner--degraded" role="status" aria-live="polite">
        <div className="storage-health-content">
          <strong>Save reliability is degraded</strong>
          <span>
            {failureCount} save attempt{failureCount !== 1 ? "s" : ""} failed
            {lastFailureKey ? ` for ${lastFailureKey}` : ""}. Use recovery
            options to protect your work.
          </span>
        </div>
        <button type="button" className="ghost-button" onClick={onOpenRecovery}>
          Recovery options
        </button>
      </section>
    );
  }

  return (
    <section className="storage-health-banner storage-health-banner--recovered" role="status" aria-live="polite">
      <div className="storage-health-content">
        <strong>Save reliability recovered</strong>
        <span>Your latest changes are saving again.</span>
      </div>
      <button type="button" className="ghost-button" onClick={onDismissRecovered}>
        Dismiss
      </button>
    </section>
  );
}
