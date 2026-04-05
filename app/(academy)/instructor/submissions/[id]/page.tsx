import { auth } from "@/auth";
import { curriculum } from "@/data/curriculum";
import { findLessonRecord } from "@/lib/learning-catalog";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { SubmissionReviewForm } from "./review-form";

export const metadata = {
  title: "Review Submission — Instructor",
};

export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const role = session.user.role ?? "STUDENT";
  if (role !== "INSTRUCTOR" && role !== "TA") {
    redirect("/dashboard?error=unauthorized");
  }

  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!submission) notFound();

  const lessonRecord = findLessonRecord(curriculum, submission.lessonId);
  const lessonTitle = lessonRecord?.lesson.title ?? submission.lessonId;
  const transferTask = lessonRecord?.lesson.transferTask;

  return (
    <div>
      <h1 className="page-title">Review Submission</h1>

      <div className="panel" style={{ padding: "24px", marginBottom: "24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "4px 16px",
            marginBottom: "16px",
          }}
        >
          <strong>Student:</strong>
          <span>
            {submission.user.name ?? submission.user.email ?? "Unknown"}
          </span>
          <strong>Lesson:</strong>
          <span>{lessonTitle}</span>
          <strong>Status:</strong>
          <span className="assessment-badge">{submission.status}</span>
          <strong>Submitted:</strong>
          <span>{submission.updatedAt.toLocaleDateString()}</span>
        </div>
      </div>

      {transferTask && (
        <div
          className="panel"
          style={{ padding: "24px", marginBottom: "24px" }}
        >
          <h2 style={{ marginBottom: "12px" }}>Transfer Task Reference</h2>
          <p>
            <strong>Prompt:</strong> {transferTask.prompt}
          </p>
          {transferTask.placeholder && (
            <p style={{ marginTop: "8px", color: "var(--muted)" }}>
              <strong>Expected format:</strong> {transferTask.placeholder}
            </p>
          )}
          {transferTask.hint && (
            <p style={{ marginTop: "8px", color: "var(--muted)" }}>
              <strong>Hint:</strong> {transferTask.hint}
            </p>
          )}
        </div>
      )}

      <div className="panel" style={{ padding: "24px", marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "12px" }}>Student Response</h2>
        <div
          style={{
            padding: "16px",
            background: "var(--surface, #f5f5f5)",
            borderRadius: "6px",
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            fontSize: "14px",
          }}
        >
          {submission.content}
        </div>
      </div>

      <SubmissionReviewForm
        submissionId={submission.id}
        currentStatus={submission.status}
        existingFeedback={submission.feedback}
        existingGrade={submission.grade}
      />
    </div>
  );
}
