"use client";

import { useState, useEffect, useCallback } from "react";

type Submission = {
  id: string;
  lessonId: string;
  content: string;
  status: "DRAFT" | "SUBMITTED" | "REVIEWED";
  feedback?: string | null;
  grade?: number | null;
};

type SubmissionPanelProps = {
  lessonId: string;
};

export function SubmissionPanel({ lessonId }: SubmissionPanelProps) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadSubmission = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions");
      if (!res.ok) return;
      const data = (await res.json()) as { submissions: Submission[] };
      const existing = data.submissions.find(
        (s: Submission) => s.lessonId === lessonId,
      );
      if (existing) {
        setSubmission(existing);
        setContent(existing.content);
      }
    } finally {
      setLoaded(true);
    }
  }, [lessonId]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, content }),
      });
      if (!res.ok) {
        setError("Failed to create submission");
        return;
      }
      const data = (await res.json()) as { submission: Submission };
      setSubmission(data.submission);
    } catch {
      setError("Failed to create submission");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDraft() {
    if (!submission) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, status: "DRAFT" }),
      });
      if (!res.ok) {
        setError("Failed to save draft");
        return;
      }
      const data = (await res.json()) as { submission: Submission };
      setSubmission(data.submission);
    } catch {
      setError("Failed to save draft");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!submission) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, status: "SUBMITTED" }),
      });
      if (!res.ok) {
        setError("Failed to submit");
        return;
      }
      const data = (await res.json()) as { submission: Submission };
      setSubmission(data.submission);
    } catch {
      setError("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded) return null;

  const isDraft = !submission || submission.status === "DRAFT";
  const isSubmitted = submission?.status === "SUBMITTED";
  const isReviewed = submission?.status === "REVIEWED";

  return (
    <div className="panel" style={{ padding: "16px", marginTop: "16px" }}>
      <h4 style={{ marginBottom: "8px" }}>Submission</h4>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isReviewed
          ? `Submission reviewed${submission?.grade != null ? `. Grade: ${submission.grade} out of 100` : ""}`
          : isSubmitted
            ? "Submission submitted — awaiting review"
            : ""}
      </div>

      {isReviewed && (
        <div style={{ marginBottom: "12px" }}>
          <span
            className="assessment-badge"
            style={{ background: "var(--success, #22c55e)", color: "#fff" }}
          >
            Reviewed
          </span>
          {submission.grade != null && (
            <span style={{ marginLeft: "8px", fontWeight: 600 }}>
              Grade: {submission.grade}/100
            </span>
          )}
          {submission.feedback && (
            <div
              style={{
                marginTop: "8px",
                padding: "12px",
                background: "var(--surface, #f5f5f5)",
                borderRadius: "6px",
              }}
            >
              <strong>Instructor Feedback:</strong>
              <p style={{ marginTop: "4px", whiteSpace: "pre-wrap" }}>
                {submission.feedback}
              </p>
            </div>
          )}
        </div>
      )}

      {isSubmitted && (
        <div style={{ marginBottom: "12px" }}>
          <span className="assessment-badge">Submitted — Awaiting Review</span>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitted || isReviewed}
        placeholder="Write your response here..."
        aria-label="Submission response"
        rows={8}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          fontFamily: "inherit",
          fontSize: "14px",
          resize: "vertical",
          background:
            isSubmitted || isReviewed ? "var(--surface, #f5f5f5)" : undefined,
        }}
      />

      {error && (
        <p role="alert" style={{ color: "var(--error, #ef4444)", marginTop: "8px" }}>
          {error}
        </p>
      )}

      {isDraft && (
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          {!submission ? (
            <button
              className="btn"
              onClick={handleCreate}
              disabled={saving || !content.trim()}
            >
              {saving ? "Saving…" : "Create Draft"}
            </button>
          ) : (
            <>
              <button
                className="btn"
                onClick={handleSaveDraft}
                disabled={saving || !content.trim()}
              >
                {saving ? "Saving…" : "Save Draft"}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
