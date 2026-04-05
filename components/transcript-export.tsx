"use client";

import { useCallback, useState } from "react";

export function TranscriptExport() {
  const [downloading, setDownloading] = useState(false);

  const handleExportJson = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/export/transcript");
      if (!res.ok) {
        throw new Error(`Export failed: ${res.status}`);
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "computelearn-transcript.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail — user will see no download
    } finally {
      setDownloading(false);
    }
  }, []);

  const handlePrintTranscript = useCallback(() => {
    window.open("/api/export/transcript/pdf", "_blank");
  }, []);

  return (
    <div className="transcript-export">
      <h3 className="transcript-export-title">Export Transcript</h3>
      <p className="transcript-export-desc">
        Download your learning record or print a transcript for your portfolio.
      </p>
      <div className="transcript-export-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleExportJson}
          disabled={downloading}
          aria-label="Export transcript as JSON file"
        >
          {downloading ? "Exporting…" : "Export JSON"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handlePrintTranscript}
          aria-label="Print transcript as PDF"
        >
          Print Transcript
        </button>
      </div>
    </div>
  );
}
