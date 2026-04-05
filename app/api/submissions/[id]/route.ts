import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

  const { content, status } = body as Record<string, unknown>;

  if (status !== undefined && status !== "DRAFT" && status !== "SUBMITTED") {
    return NextResponse.json(
      { error: "status must be DRAFT or SUBMITTED" },
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

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only DRAFT submissions can be edited" },
        { status: 409 },
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
