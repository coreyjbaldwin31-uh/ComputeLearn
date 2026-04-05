import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const userId = session.user.id;

    const [user, progress, competencies, submissions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      }),
      prisma.progress.findMany({ where: { userId } }),
      prisma.competencySnapshot.findMany({ where: { userId } }),
      prisma.submission.findMany({
        where: { userId },
        select: { lessonId: true, grade: true, status: true },
      }),
    ]);

    const studentName = escapeHtml(user?.name ?? "Unknown Student");
    const studentEmail = escapeHtml(user?.email ?? "");
    const generatedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const progressRows = progress
      .map(
        (p) =>
          `<tr><td>${escapeHtml(p.lessonId)}</td><td>${p.completed ? "✓ Completed" : `Step ${p.step}`}</td></tr>`,
      )
      .join("");

    const competencyRows = competencies
      .map(
        (c) =>
          `<tr><td>${escapeHtml(c.domain)}</td><td>${c.level.toFixed(1)}</td></tr>`,
      )
      .join("");

    const gradeRows = submissions
      .filter((s) => s.grade != null)
      .map(
        (s) =>
          `<tr><td>${escapeHtml(s.lessonId)}</td><td>${s.grade!.toFixed(1)}</td><td>${escapeHtml(s.status)}</td></tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>ComputeLearn Transcript — ${studentName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.5; }
  h1 { font-size: 1.6rem; margin-bottom: 4px; }
  h2 { font-size: 1.1rem; margin: 28px 0 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
  .meta { color: #64748b; font-size: 0.9rem; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 0.88rem; }
  th { background: #f8fafc; font-weight: 600; }
  .empty { color: #94a3b8; font-style: italic; }
  @media print {
    body { padding: 20px; }
    h2 { break-after: avoid; }
    table { break-inside: avoid; }
  }
</style>
</head>
<body>
<h1>ComputeLearn — Student Transcript</h1>
<p class="meta">${studentName}${studentEmail ? ` &middot; ${studentEmail}` : ""} &middot; Generated ${generatedDate}</p>

<h2>Lesson Progress</h2>
${
  progressRows
    ? `<table><thead><tr><th>Lesson</th><th>Status</th></tr></thead><tbody>${progressRows}</tbody></table>`
    : '<p class="empty">No lesson progress recorded yet.</p>'
}

<h2>Competency Summary</h2>
${
  competencyRows
    ? `<table><thead><tr><th>Domain</th><th>Level</th></tr></thead><tbody>${competencyRows}</tbody></table>`
    : '<p class="empty">No competency data recorded yet.</p>'
}

<h2>Submission Grades</h2>
${
  gradeRows
    ? `<table><thead><tr><th>Lesson</th><th>Grade</th><th>Status</th></tr></thead><tbody>${gradeRows}</tbody></table>`
    : '<p class="empty">No graded submissions yet.</p>'
}
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
