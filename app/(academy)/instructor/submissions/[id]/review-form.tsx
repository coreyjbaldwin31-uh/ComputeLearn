"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./review-form.module.css";

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
    <div className={`panel ${styles.panel}`}>
      <h2 className={styles.title}>
        {isReviewed ? "Review (Completed)" : "Review"}
      </h2>

      <label htmlFor="submission-review-feedback" className={styles.label}>
        Feedback
      </label>
      <textarea
        id="submission-review-feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        disabled={isReviewed}
        placeholder="Provide feedback for the student..."
        rows={6}
        className={styles.feedbackInput}
      />

      <label htmlFor="submission-review-grade" className={styles.label}>
        Grade (0–100)
      </label>
      <input
        id="submission-review-grade"
        type="number"
        min={0}
        max={100}
        step={1}
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        disabled={isReviewed}
        className={styles.gradeInput}
      />

      {error && (
        <p role="alert" className={styles.error}>
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
