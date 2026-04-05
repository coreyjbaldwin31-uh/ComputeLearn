import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isInstructorOrTA(role: string | undefined): boolean {
  return role === "INSTRUCTOR" || role === "TA";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isInstructorOrTA(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ enrollments });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isInstructorOrTA(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { email, courseId } = body as Record<string, unknown>;

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 },
    );
  }
  if (!courseId || typeof courseId !== "string") {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 },
    );
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 },
    );
  }

  try {
    // Find or create the user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, role: "STUDENT" },
      });
    }

    // Create enrollment (upsert to avoid duplicates)
    const enrollment = await prisma.enrollment.upsert({
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
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isInstructorOrTA(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const enrollmentId = searchParams.get("id");

  if (!enrollmentId) {
    return NextResponse.json(
      { error: "Enrollment id is required" },
      { status: 400 },
    );
  }

  try {
    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Enrollment not found or already removed" },
      { status: 404 },
    );
  }
}
