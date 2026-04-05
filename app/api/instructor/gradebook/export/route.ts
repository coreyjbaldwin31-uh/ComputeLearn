import { curriculum } from "@/data/curriculum";
import { auditLog } from "@/lib/audit-log";
import { requireRole } from "@/lib/auth-helpers";
import { getLessonRecords } from "@/lib/learning-catalog";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const result = await requireRole(["INSTRUCTOR", "TA"]);
  if (result.error) return result.error;

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

  // Build unique students
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

  // CSV header
  const lessonHeaders = lessons.map((l) => `"${l.title.replace(/"/g, '""')}"`);
  const header = ["Student Name", "Email", ...lessonHeaders].join(",");

  // CSV rows
  const rows = students.map((student) => {
    const name = (student.name ?? "Unknown").replace(/"/g, '""');
    const email = (student.email ?? "").replace(/"/g, '""');
    const grades = lessons.map((l) => {
      const grade = gradeMap.get(student.id)?.get(l.id);
      return grade != null ? grade.toString() : "";
    });
    return [`"${name}"`, `"${email}"`, ...grades].join(",");
  });

  const csv = [header, ...rows].join("\n");

  auditLog({
    userId: result.session.user.id,
    action: "GRADE_EXPORT",
    resource: "/instructor/gradebook/export",
    details: { studentCount: students.length, lessonCount: lessons.length },
    ip: request.headers.get("x-forwarded-for") ?? null,
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="gradebook.csv"',
    },
  });
}
