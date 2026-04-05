"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SubmissionReviewFormProps = {
  submissionId: string;
  currentStatus: string;
  existingFeedback: string | null;
  existingGrade: number | null;
};

export function SubmissionReviewForm({
  submissionId,
  currentStatus,
  existingFeedback,
  existingGrade,
}: SubmissionReviewFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState(existingFeedback ?? "");
  const [grade, setGrade] = useState(existingGrade?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReviewed = currentStatus === "REVIEWED";

  async function handleApprove() {
    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      setError("Grade must be a number between 0 and 100");
      return;
    }
    if (!feedback.trim()) {
      setError("Feedback is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback,
          grade: gradeNum,
          status: "REVIEWED",
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Failed to save review");
        return;
      }
      router.push("/instructor/submissions");
      router.refresh();
    } catch {
      setError("Failed to save review");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel" style={{ padding: "24px" }}>
      <h2 style={{ marginBottom: "12px" }}>
        {isReviewed ? "Review (Completed)" : "Review"}
      </h2>

      <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
        Feedback
      </label>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        disabled={isReviewed}
        placeholder="Provide feedback for the student..."
        rows={6}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          fontFamily: "inherit",
          fontSize: "14px",
          resize: "vertical",
          marginBottom: "16px",
        }}
      />

      <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
        Grade (0–100)
      </label>
      <input
        type="number"
        min={0}
        max={100}
        step={1}
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        disabled={isReviewed}
        style={{
          width: "120px",
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          fontFamily: "inherit",
          fontSize: "14px",
          marginBottom: "16px",
        }}
      />

      {error && (
        <p
          role="alert"
          style={{ color: "var(--error, #ef4444)", marginBottom: "12px" }}
        >
          {error}
        </p>
      )}

      {!isReviewed && (
        <div>
          <button
            className="btn btn-primary"
            onClick={handleApprove}
            disabled={saving}
          >
            {saving ? "Saving…" : "Approve & Mark Reviewed"}
          </button>
        </div>
      )}
    </div>
  );
}
