import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit-log";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: session.user.id },
    });
    return NextResponse.json({ submissions });
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { lessonId, content } = body as Record<string, unknown>;

  if (!lessonId || typeof lessonId !== "string") {
    return NextResponse.json(
      { error: "lessonId is required" },
      { status: 400 },
    );
  }

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        lessonId,
        content,
        status: "DRAFT",
      },
    });
    auditLog({
      userId: session.user.id,
      action: "SUBMISSION_CREATE",
      resource: `/submissions/${submission.id}`,
      details: { lessonId },
      ip: request.headers.get("x-forwarded-for") ?? null,
    });
    return NextResponse.json({ submission }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
