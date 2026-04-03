"use client";

export type StorageRecoveryLogEntry = {
  id: string;
  atLabel: string;
  key: string | null;
  outcome:
    | "error"
    | "retry-success"
    | "retry-failed"
    | "backup-exported"
    | "local-reset";
  message: string;
};

type StorageRecoveryLogProps = {
  entries: StorageRecoveryLogEntry[];
};

const outcomeLabel: Record<StorageRecoveryLogEntry["outcome"], string> = {
  error: "Write failed",
  "retry-success": "Retry succeeded",
  "retry-failed": "Retry failed",
  "backup-exported": "Backup exported",
  "local-reset": "Local data reset",
};

export function StorageRecoveryLog({ entries }: StorageRecoveryLogProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section
      className="storage-recovery-log panel"
      aria-label="Recent storage incidents"
    >
      <h3>Recent storage incidents</h3>
      <p className="panel-subtext">
        Latest persistence events for quick diagnosis and confidence checks.
      </p>
      <ul className="storage-recovery-log-list">
        {entries.map((entry) => (
          <li key={entry.id} className="storage-recovery-log-item">
            <span className="storage-recovery-log-outcome">
              {outcomeLabel[entry.outcome]}
            </span>
            <span className="storage-recovery-log-meta">
              {entry.atLabel}
              {entry.key ? ` - ${entry.key}` : ""}
            </span>
            <span className="storage-recovery-log-message">
              {entry.message}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
