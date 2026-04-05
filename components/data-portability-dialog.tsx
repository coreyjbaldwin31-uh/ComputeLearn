"use client";

import { useCallback, useId, useRef, useState } from "react";
import styles from "./data-portability-dialog.module.css";
import { useFocusTrap } from "./hooks/use-focus-trap";

type DataPortabilityDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const KNOWN_KEYS = [
  "computelearn-progress",
  "computelearn-transfer",
  "computelearn-attempts",
  "computelearn-artifacts",
  "computelearn-reviews",
  "computelearn-notes",
  "computelearn-reflections",
  "computelearn-profile",
  "computelearn-lab-instances",
] as const;

const LAST_EXPORT_KEY = "computelearn-last-export";

type BackupPayload = {
  version: number;
  exportedAt: string;
  platform: string;
  data: Record<string, unknown>;
};

type ImportPreview = {
  keys: { key: string; summary: string }[];
  raw: BackupPayload;
};

function gatherExportData(): BackupPayload {
  const data: Record<string, unknown> = {};
  for (const key of KNOWN_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    platform: "ComputeLearn",
    data,
  };
}

function estimateSize(): string {
  let total = 0;
  for (const key of KNOWN_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      total += raw.length;
    }
  }
  if (total < 1024) return `~${total} B`;
  return `~${(total / 1024).toFixed(1)} KB`;
}

function summarizeValue(value: unknown): string {
  if (Array.isArray(value)) return `${value.length} items`;
  if (value && typeof value === "object") {
    const count = Object.keys(value).length;
    return `${count} entries`;
  }
  return "1 value";
}

function validateBackup(
  parsed: unknown,
): { ok: true; payload: BackupPayload } | { ok: false; error: string } {
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "File does not contain a valid JSON object." };
  }
  const obj = parsed as Record<string, unknown>;
  if (obj.version !== 1) {
    return { ok: false, error: "Unsupported backup version." };
  }
  if (obj.platform !== "ComputeLearn") {
    return { ok: false, error: "This file is not a ComputeLearn backup." };
  }
  if (!obj.data || typeof obj.data !== "object") {
    return { ok: false, error: "Backup contains no data section." };
  }
  const dataKeys = Object.keys(obj.data as Record<string, unknown>);
  const knownSet = new Set<string>(KNOWN_KEYS);
  const validKeys = dataKeys.filter((k) => knownSet.has(k));
  if (validKeys.length === 0) {
    return { ok: false, error: "Backup contains no recognized data keys." };
  }
  return { ok: true, payload: obj as unknown as BackupPayload };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

export function DataPortabilityDialog({
  isOpen,
  onClose,
}: DataPortabilityDialogProps) {
  const dialogRef = useFocusTrap(isOpen);
  const titleId = useId();
  const descId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importPreview, setImportPreview] = useState<ImportPreview | null>(
    null,
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = useCallback(() => {
    const payload = gatherExportData();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `computelearn-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    localStorage.setItem(LAST_EXPORT_KEY, new Date().toISOString());
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setImportPreview(null);
      setImportError(null);
      setImportSuccess(false);
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed: unknown = JSON.parse(reader.result as string);
          const result = validateBackup(parsed);
          if (!result.ok) {
            setImportError(result.error);
            return;
          }
          const knownSet = new Set<string>(KNOWN_KEYS);
          const keys = Object.entries(result.payload.data)
            .filter(([k]) => knownSet.has(k))
            .map(([k, v]) => ({ key: k, summary: summarizeValue(v) }));
          setImportPreview({ keys, raw: result.payload });
        } catch {
          setImportError("Could not parse file as JSON.");
        }
      };
      reader.onerror = () => {
        setImportError("Failed to read the selected file.");
      };
      reader.readAsText(file);
    },
    [],
  );

  const handleImport = useCallback(() => {
    if (!importPreview) return;
    const knownSet = new Set<string>(KNOWN_KEYS);
    for (const [key, value] of Object.entries(importPreview.raw.data)) {
      if (knownSet.has(key)) {
        localStorage.setItem(
          key,
          typeof value === "string" ? value : JSON.stringify(value),
        );
      }
    }
    setImportSuccess(true);
    setImportPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [importPreview]);

  if (!isOpen) return null;

  const lastExport = localStorage.getItem(LAST_EXPORT_KEY);

  return (
    <div className="confirm-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className={`confirm-dialog ${styles.dialog}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
      >
        <h4 id={titleId}>Data Portability</h4>
        <p id={descId}>
          Export your learning data as a backup file, or import a previous
          backup to restore progress.
        </p>

        {/* Export Section */}
        <div className={styles.section}>
          <h5 className={styles.sectionHeading}>Export Backup</h5>
          <p className={styles.sectionDesc}>
            Download all learning data stored in this browser.
          </p>
          <div className={styles.meta}>
            <span>Size: {estimateSize()}</span>
            {lastExport && <span>Last export: {formatDate(lastExport)}</span>}
          </div>
          <button
            type="button"
            className={`ghost-button ${styles.downloadBtn}`}
            onClick={handleExport}
          >
            Download Backup
          </button>
        </div>

        {/* Import Section */}
        <div className={styles.section}>
          <h5 className={styles.sectionHeading}>Import Backup</h5>
          <p className={styles.warning}>
            ⚠ This will replace your current progress. Export your data first if
            you want to keep it.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className={styles.fileInput}
            onChange={handleFileChange}
            aria-label="Choose backup file"
          />

          {importError && (
            <p className={styles.error} role="alert">
              {importError}
            </p>
          )}

          {importPreview && (
            <div className={styles.preview}>
              <p className={styles.previewHeading}>Data to import:</p>
              <ul className={styles.previewList}>
                {importPreview.keys.map(({ key, summary }) => (
                  <li key={key}>
                    <span className={styles.previewKey}>
                      {key.replace("computelearn-", "")}
                    </span>
                    : {summary}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`confirm-destructive ${styles.importBtn}`}
                onClick={handleImport}
              >
                Import &amp; Replace
              </button>
            </div>
          )}

          {importSuccess && (
            <p className={styles.success} role="status">
              Data imported successfully. Reload the page to see updated
              progress.
            </p>
          )}
        </div>

        <div className="confirm-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={onClose}
            autoFocus
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
