import { auth } from "@/auth";
import { curriculum } from "@/data/curriculum";
import { findLessonRecord } from "@/lib/learning-catalog";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { SubmissionReviewForm } from "./review-form";
import styles from "./submission-review-page.module.css";

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

      <div className={`panel ${styles.panelBlock}`}>
        <div className={styles.metaGrid}>
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
        <div className={`panel ${styles.panelBlock}`}>
          <h2 className={styles.sectionTitle}>Transfer Task Reference</h2>
          <p>
            <strong>Prompt:</strong> {transferTask.prompt}
          </p>
          {transferTask.placeholder && (
            <p className={styles.mutedNote}>
              <strong>Expected format:</strong> {transferTask.placeholder}
            </p>
          )}
          {transferTask.hint && (
            <p className={styles.mutedNote}>
              <strong>Hint:</strong> {transferTask.hint}
            </p>
          )}
        </div>
      )}

      <div className={`panel ${styles.panelBlock}`}>
        <h2 className={styles.sectionTitle}>Student Response</h2>
        <div className={styles.responseBody}>{submission.content}</div>
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
