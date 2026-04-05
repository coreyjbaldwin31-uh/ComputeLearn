import { auth } from "@/auth";
import { RosterManagement } from "@/components/roster-management";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export const metadata = {
  title: "Instructor Dashboard",
};

export default async function InstructorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const role = session.user.role ?? "STUDENT";
  if (role !== "INSTRUCTOR" && role !== "TA") {
    redirect("/dashboard?error=unauthorized");
  }

  const [enrollments, allProgress, competencies] = await Promise.all([
    prisma.enrollment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    }),
    prisma.progress.findMany({
      where: { completed: true },
    }),
    prisma.competencySnapshot.findMany(),
  ]);

  // Build per-student maps
  const studentMap = new Map<
    string,
    {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      courses: string[];
      lessonsCompleted: number;
      avgCompetency: number;
      lastActive: Date | null;
    }
  >();

  for (const enrollment of enrollments) {
    const uid = enrollment.userId;
    if (!studentMap.has(uid)) {
      studentMap.set(uid, {
        id: enrollment.user.id,
        name: enrollment.user.name,
        email: enrollment.user.email,
        image: enrollment.user.image,
        courses: [],
        lessonsCompleted: 0,
        avgCompetency: 0,
        lastActive: null,
      });
    }
    studentMap.get(uid)!.courses.push(enrollment.courseId);
  }

  // Count completed lessons per student
  const progressByUser = new Map<string, { count: number; latest: Date }>();
  for (const p of allProgress) {
    const existing = progressByUser.get(p.userId);
    if (!existing) {
      progressByUser.set(p.userId, { count: 1, latest: p.updatedAt });
    } else {
      existing.count++;
      if (p.updatedAt > existing.latest) existing.latest = p.updatedAt;
    }
  }

  // Avg competency per student
  const compByUser = new Map<string, { total: number; count: number }>();
  for (const c of competencies) {
    const existing = compByUser.get(c.userId);
    if (!existing) {
      compByUser.set(c.userId, { total: c.level, count: 1 });
    } else {
      existing.total += c.level;
      existing.count++;
    }
  }

  const totalLessons = 38;
  const students = Array.from(studentMap.values()).map((s) => {
    const prog = progressByUser.get(s.id);
    const comp = compByUser.get(s.id);
    return {
      ...s,
      lessonsCompleted: prog?.count ?? 0,
      avgCompetency: comp ? comp.total / comp.count : 0,
      lastActive: prog?.latest ?? null,
    };
  });

  const totalStudents = students.length;
  const avgCompletion =
    totalStudents > 0
      ? students.reduce(
          (sum, s) => sum + s.lessonsCompleted / totalLessons,
          0,
        ) / totalStudents
      : 0;
  const atRisk = students.filter(
    (s) => s.lessonsCompleted / totalLessons < 0.25,
  ).length;

  return (
    <div>
      <h1 className="page-title">Instructor Dashboard</h1>

      <div className={`stats ${styles.statsSpacing}`}>
        <div className="stat-card">
          <span>Total Students</span>
          <p className="stat-value">{totalStudents}</p>
        </div>
        <div className="stat-card">
          <span>Avg Completion</span>
          <p className="stat-value">{Math.round(avgCompletion * 100)}%</p>
        </div>
        <div className="stat-card">
          <span>At Risk (&lt;25%)</span>
          <p className="stat-value">{atRisk}</p>
        </div>
      </div>

      <div className={`panel ${styles.panelSection} ${styles.panelSpacing}`}>
        <h2 className={styles.sectionHeading}>Student Roster</h2>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <caption className="sr-only">
              Student roster with enrollment and progress details
            </caption>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th scope="col" className={styles.cell}>
                  Name
                </th>
                <th scope="col" className={styles.cell}>
                  Email
                </th>
                <th scope="col" className={styles.cell}>
                  Enrolled Courses
                </th>
                <th scope="col" className={styles.cell}>
                  Lessons Completed
                </th>
                <th scope="col" className={styles.cell}>
                  Avg Competency
                </th>
                <th scope="col" className={styles.cell}>
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className={styles.tableRow}>
                  <td className={styles.cell}>
                    <a
                      href={`/instructor/students/${student.id}`}
                      className={styles.studentLink}
                    >
                      {student.name ?? "Unknown"}
                    </a>
                  </td>
                  <td className={`${styles.cell} ${styles.mutedCell}`}>
                    {student.email ?? "—"}
                  </td>
                  <td className={styles.cell}>{student.courses.length}</td>
                  <td className={styles.cell}>
                    {student.lessonsCompleted}/{totalLessons}
                  </td>
                  <td className={styles.cell}>
                    {student.avgCompetency.toFixed(1)}
                  </td>
                  <td className={`${styles.cell} ${styles.mutedCell}`}>
                    {student.lastActive
                      ? student.lastActive.toLocaleDateString()
                      : "Never"}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    No students enrolled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`panel ${styles.panelSection}`}>
        <h2 className={styles.sectionHeading}>Roster Management</h2>
        <RosterManagement
          initialEnrollments={enrollments.map((e) => ({
            id: e.id,
            userId: e.userId,
            courseId: e.courseId,
            role: e.role,
            createdAt: e.createdAt.toISOString(),
            userName: e.user.name,
            userEmail: e.user.email,
          }))}
        />
      </div>
    </div>
  );
}
