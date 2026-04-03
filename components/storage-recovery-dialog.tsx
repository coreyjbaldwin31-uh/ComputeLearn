"use client";

import { useId } from "react";
import { useFocusTrap } from "./hooks/use-focus-trap";

type StorageRecoveryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onExportBackup: () => void;
  onResetLocalData: () => void;
};

export function StorageRecoveryDialog({
  isOpen,
  onClose,
  onRetry,
  onExportBackup,
  onResetLocalData,
}: StorageRecoveryDialogProps) {
  const dialogRef = useFocusTrap(isOpen);
  const titleId = useId();
  const descriptionId = useId();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirm-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="confirm-dialog storage-recovery-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
        }}
      >
        <h4 id={titleId}>Storage recovery options</h4>
        <p id={descriptionId}>
          We could not save your latest changes to browser storage. Choose a
          recovery action below to protect your work.
        </p>

        <ul className="storage-recovery-list" aria-label="Recovery actions">
          <li>Retry save if storage is available again.</li>
          <li>Export your artifacts as a backup file.</li>
          <li>Reset local learning data only if recovery fails repeatedly.</li>
        </ul>

        <div className="confirm-actions storage-recovery-actions">
          <button
            type="button"
            className="ghost-button"
            autoFocus
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="button" className="ghost-button" onClick={onRetry}>
            Retry save
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={onExportBackup}
          >
            Export backup
          </button>
          <button
            type="button"
            className="confirm-destructive"
            onClick={onResetLocalData}
          >
            Reset local data
          </button>
        </div>
      </div>
    </div>
  );
}
