import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const [user, progress, competencies, submissions, labAttempts] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        }),
        prisma.progress.findMany({ where: { userId } }),
        prisma.competencySnapshot.findMany({ where: { userId } }),
        prisma.submission.findMany({
          where: { userId },
          select: {
            lessonId: true,
            grade: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.labAttempt.findMany({
          where: { userId },
          select: { lessonId: true, attempt: true, passed: true },
        }),
      ]);

    // Summarise lab attempts per lesson
    const labSummaryMap = new Map<
      string,
      { attempts: number; passed: boolean }
    >();
    for (const la of labAttempts) {
      const existing = labSummaryMap.get(la.lessonId);
      if (existing) {
        existing.attempts = Math.max(existing.attempts, la.attempt);
        if (la.passed) existing.passed = true;
      } else {
        labSummaryMap.set(la.lessonId, {
          attempts: la.attempt,
          passed: la.passed,
        });
      }
    }

    const labSummary = Array.from(labSummaryMap.entries()).map(
      ([lessonId, data]) => ({
        lessonId,
        attempts: data.attempts,
        passed: data.passed,
      }),
    );

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      student: {
        name: user?.name ?? null,
        email: user?.email ?? null,
      },
      progress: progress.map((p) => ({
        lessonId: p.lessonId,
        step: p.step,
        completed: p.completed,
      })),
      competencies: competencies.map((c) => ({
        domain: c.domain,
        level: c.level,
      })),
      submissions: submissions.map((s) => ({
        lessonId: s.lessonId,
        grade: s.grade,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      })),
      labAttempts: labSummary,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
