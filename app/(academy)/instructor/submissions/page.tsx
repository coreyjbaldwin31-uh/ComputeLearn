import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { curriculum } from "@/data/curriculum";
import { getLessonRecords } from "@/lib/learning-catalog";
import Link from "next/link";

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

      <div className="panel" style={{ padding: "24px" }}>
        {submissions.length === 0 ? (
          <p style={{ color: "var(--muted)", textAlign: "center" }}>
            No submissions awaiting review.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--border)",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "8px 12px" }}>Student</th>
                  <th style={{ padding: "8px 12px" }}>Lesson</th>
                  <th style={{ padding: "8px 12px" }}>Submitted</th>
                  <th style={{ padding: "8px 12px" }}>Status</th>
                  <th style={{ padding: "8px 12px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "8px 12px" }}>
                      {sub.user.name ?? sub.user.email ?? "Unknown"}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {lessonMap.get(sub.lessonId) ?? sub.lessonId}
                    </td>
                    <td style={{ padding: "8px 12px", color: "var(--muted)" }}>
                      {sub.updatedAt.toLocaleDateString()}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <span className="assessment-badge">{sub.status}</span>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <Link
                        href={`/instructor/submissions/${sub.id}`}
                        style={{ color: "var(--accent)" }}
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
