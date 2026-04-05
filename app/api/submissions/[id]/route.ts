import { auth } from "@/auth";
import { auditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { content, status, feedback, grade } = body as Record<string, unknown>;

  const MAX_CONTENT = 100_000;
  if (typeof content === "string" && content.length > MAX_CONTENT) {
    return NextResponse.json(
      { error: `content must be ${MAX_CONTENT} characters or fewer` },
      { status: 400 },
    );
  }
  if (typeof feedback === "string" && feedback.length > MAX_CONTENT) {
    return NextResponse.json(
      { error: `feedback must be ${MAX_CONTENT} characters or fewer` },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.submission.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }

    const userRole = (session.user.role ?? "STUDENT") as string;
    const isInstructor = userRole === "INSTRUCTOR" || userRole === "TA";

    // Instructor review path: can set feedback, grade, and mark REVIEWED
    if (isInstructor && status === "REVIEWED") {
      if (existing.status !== "SUBMITTED") {
        return NextResponse.json(
          { error: "Only SUBMITTED submissions can be reviewed" },
          { status: 409 },
        );
      }

      const gradeNum =
        typeof grade === "number"
          ? grade
          : typeof grade === "string"
            ? parseFloat(grade)
            : undefined;
      if (
        gradeNum !== undefined &&
        (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100)
      ) {
        return NextResponse.json(
          { error: "Grade must be between 0 and 100" },
          { status: 400 },
        );
      }

      const submission = await prisma.submission.update({
        where: { id },
        data: {
          status: "REVIEWED",
          ...(typeof feedback === "string" && { feedback }),
          ...(gradeNum !== undefined && { grade: gradeNum }),
        },
      });
      auditLog({
        userId: session.user.id,
        action: "SUBMISSION_REVIEW",
        resource: `/submissions/${id}`,
        details: { grade: gradeNum },
        ip: request.headers.get("x-forwarded-for") ?? null,
      });
      return NextResponse.json({ submission });
    }

    // Student path: must own the submission
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only DRAFT submissions can be edited" },
        { status: 409 },
      );
    }

    if (status !== undefined && status !== "DRAFT" && status !== "SUBMITTED") {
      return NextResponse.json(
        { error: "status must be DRAFT or SUBMITTED" },
        { status: 400 },
      );
    }

    const submission = await prisma.submission.update({
      where: { id },
      data: {
        ...(typeof content === "string" && { content }),
        ...(typeof status === "string" && {
          status: status as "DRAFT" | "SUBMITTED",
        }),
      },
    });
    return NextResponse.json({ submission });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
