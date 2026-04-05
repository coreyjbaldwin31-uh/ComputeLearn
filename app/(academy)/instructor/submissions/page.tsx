import { auth } from "@/auth";
import { curriculum } from "@/data/curriculum";
import { getLessonRecords } from "@/lib/learning-catalog";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./submissions-page.module.css";

export const metadata = {
  title: "Submissions — Instructor",
};

export default async function InstructorSubmissionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const role = session.user.role ?? "STUDENT";
  if (role !== "INSTRUCTOR" && role !== "TA") {
    redirect("/dashboard?error=unauthorized");
  }

  const lessonRecords = getLessonRecords(curriculum);
  const lessonMap = new Map(
    lessonRecords.map((r) => [r.lesson.id, r.lesson.title]),
  );

  const submissions = await prisma.submission.findMany({
    where: { status: "SUBMITTED" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="page-title">Pending Submissions</h1>

      <div className={`panel ${styles.panel}`}>
        {submissions.length === 0 ? (
          <p className={styles.emptyState}>No submissions awaiting review.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="sr-only">
                Pending student submissions awaiting review
              </caption>
              <thead>
                <tr className={styles.headRow}>
                  <th scope="col" className={styles.cell}>
                    Student
                  </th>
                  <th scope="col" className={styles.cell}>
                    Lesson
                  </th>
                  <th scope="col" className={styles.cell}>
                    Submitted
                  </th>
                  <th scope="col" className={styles.cell}>
                    Status
                  </th>
                  <th scope="col" className={styles.cell}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} className={styles.row}>
                    <td className={styles.cell}>
                      {sub.user.name ?? sub.user.email ?? "Unknown"}
                    </td>
                    <td className={styles.cell}>
                      {lessonMap.get(sub.lessonId) ?? sub.lessonId}
                    </td>
                    <td className={`${styles.cell} ${styles.muted}`}>
                      {sub.updatedAt.toLocaleDateString()}
                    </td>
                    <td className={styles.cell}>
                      <span className="assessment-badge">{sub.status}</span>
                    </td>
                    <td className={styles.cell}>
                      <Link
                        href={`/instructor/submissions/${sub.id}`}
                        className={styles.reviewLink}
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
