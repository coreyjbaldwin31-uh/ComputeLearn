import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isInstructorOrTA(role: string | undefined): boolean {
  return role === "INSTRUCTOR" || role === "TA";
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isInstructorOrTA(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Failed to read request body" },
      { status: 400 },
    );
  }

  if (!text.trim()) {
    return NextResponse.json(
      { error: "Empty CSV body" },
      { status: 400 },
    );
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Skip header row if it looks like one
  const firstLine = lines[0]?.toLowerCase() ?? "";
  const startIndex =
    firstLine.includes("email") && firstLine.includes("course") ? 1 : 0;

  const results: { success: number; errors: { row: number; email: string; courseId: string; reason: string }[] } = {
    success: 0,
    errors: [],
  };

  for (let i = startIndex; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.trim());
    const email = parts[0] ?? "";
    const courseId = parts[1] ?? "";

    if (!email || !courseId) {
      results.errors.push({
        row: i + 1,
        email,
        courseId,
        reason: "Missing email or courseId",
      });
      continue;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      results.errors.push({
        row: i + 1,
        email,
        courseId,
        reason: "Invalid email format",
      });
      continue;
    }

    try {
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: { email, role: "STUDENT" },
        });
      }

      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        create: {
          userId: user.id,
          courseId,
          role: "STUDENT",
        },
        update: {},
      });
      results.success++;
    } catch {
      results.errors.push({
        row: i + 1,
        email,
        courseId,
        reason: "Database error",
      });
    }
  }

  return NextResponse.json(results);
}
