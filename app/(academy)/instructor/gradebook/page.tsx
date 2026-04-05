import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { curriculum } from "@/data/curriculum";
import { getLessonRecords } from "@/lib/learning-catalog";

export const metadata = {
  title: "Gradebook — Instructor",
};

export default async function GradebookPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const role = session.user.role ?? "STUDENT";
  if (role !== "INSTRUCTOR" && role !== "TA") {
    redirect("/dashboard?error=unauthorized");
  }

  const lessonRecords = getLessonRecords(curriculum);
  const lessons = lessonRecords.map((r) => ({
    id: r.lesson.id,
    title: r.lesson.title,
  }));

  const [enrollments, submissions] = await Promise.all([
    prisma.enrollment.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.submission.findMany({
      where: { status: "REVIEWED" },
    }),
  ]);

  // Build unique students from enrollments
  const studentMap = new Map<
    string,
    { id: string; name: string | null; email: string | null }
  >();
  for (const enrollment of enrollments) {
    if (!studentMap.has(enrollment.userId)) {
      studentMap.set(enrollment.userId, {
        id: enrollment.user.id,
        name: enrollment.user.name,
        email: enrollment.user.email,
      });
    }
  }
  const students = Array.from(studentMap.values());

  // Build grade map: userId -> lessonId -> grade
  const gradeMap = new Map<string, Map<string, number>>();
  for (const sub of submissions) {
    if (sub.grade == null) continue;
    if (!gradeMap.has(sub.userId)) {
      gradeMap.set(sub.userId, new Map());
    }
    gradeMap.get(sub.userId)!.set(sub.lessonId, sub.grade);
  }

  // Compute per-lesson averages
  const lessonAvgs = new Map<string, { total: number; count: number }>();
  for (const [, userGrades] of gradeMap) {
    for (const [lessonId, grade] of userGrades) {
      const existing = lessonAvgs.get(lessonId);
      if (!existing) {
        lessonAvgs.set(lessonId, { total: grade, count: 1 });
      } else {
        existing.total += grade;
        existing.count++;
      }
    }
  }

  // Only show lessons that have at least one graded submission
  const gradedLessons = lessons.filter((l) => lessonAvgs.has(l.id));

  // Compute per-student averages
  function studentAvg(userId: string): number | null {
    const userGrades = gradeMap.get(userId);
    if (!userGrades || userGrades.size === 0) return null;
    let total = 0;
    for (const grade of userGrades.values()) total += grade;
    return total / userGrades.size;
  }

  // Class average
  const allGrades: number[] = [];
  for (const [, userGrades] of gradeMap) {
    for (const grade of userGrades.values()) allGrades.push(grade);
  }
  const classAvg =
    allGrades.length > 0
      ? allGrades.reduce((a, b) => a + b, 0) / allGrades.length
      : null;

  return (
    <div>
      <h1 className="page-title">Gradebook</h1>

      <div className="stats" style={{ marginBottom: "24px" }}>
        <div className="stat-card">
          <span>Students</span>
          <p className="stat-value">{students.length}</p>
        </div>
        <div className="stat-card">
          <span>Graded Submissions</span>
          <p className="stat-value">{allGrades.length}</p>
        </div>
        <div className="stat-card">
          <span>Class Average</span>
          <p className="stat-value">
            {classAvg != null ? classAvg.toFixed(1) : "—"}
          </p>
        </div>
      </div>

      <div className="panel" style={{ padding: "24px", marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2>Grades</h2>
          <a
            href="/api/instructor/gradebook/export"
            className="btn"
            download="gradebook.csv"
          >
            Export CSV
          </a>
        </div>

        {students.length === 0 ? (
          <p style={{ color: "var(--muted)", textAlign: "center" }}>
            No students enrolled yet.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <caption className="sr-only">Student grades by lesson</caption>
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--border)",
                    textAlign: "left",
                  }}
                >
                  <th scope="col" style={{ padding: "8px 12px", position: "sticky", left: 0, background: "var(--bg, #fff)" }}>
                    Student
                  </th>
                  {gradedLessons.map((l) => (
                    <th
                      key={l.id}
                      scope="col"
                      style={{
                        padding: "8px 12px",
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={l.title}
                    >
                      {l.title}
                    </th>
                  ))}
                  <th scope="col" style={{ padding: "8px 12px", fontWeight: 700 }}>
                    Average
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const avg = studentAvg(student.id);
                  return (
                    <tr
                      key={student.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <th
                        scope="row"
                        style={{
                          padding: "8px 12px",
                          position: "sticky",
                          left: 0,
                          background: "var(--bg, #fff)",
                          fontWeight: "normal",
                        }}
                      >
                        {student.name ?? student.email ?? "Unknown"}
                      </th>
                      {gradedLessons.map((l) => {
                        const grade = gradeMap
                          .get(student.id)
                          ?.get(l.id);
                        return (
                          <td
                            key={l.id}
                            style={{
                              padding: "8px 12px",
                              textAlign: "center",
                            }}
                          >
                            {grade != null ? grade.toFixed(0) : "—"}
                          </td>
                        );
                      })}
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        {avg != null ? avg.toFixed(1) : "—"}
                      </td>
                    </tr>
                  );
                })}
                {/* Class averages row */}
                <tr
                  style={{
                    borderTop: "2px solid var(--border)",
                    fontWeight: 600,
                  }}
                >
                  <th
                    scope="row"
                    style={{
                      padding: "8px 12px",
                      position: "sticky",
                      left: 0,
                      background: "var(--bg, #fff)",
                    }}
                  >
                    Class Average
                  </th>
                  {gradedLessons.map((l) => {
                    const avg = lessonAvgs.get(l.id);
                    return (
                      <td
                        key={l.id}
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                        }}
                      >
                        {avg ? (avg.total / avg.count).toFixed(1) : "—"}
                      </td>
                    );
                  })}
                  <td
                    style={{
                      padding: "8px 12px",
                      textAlign: "center",
                    }}
                  >
                    {classAvg != null ? classAvg.toFixed(1) : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
