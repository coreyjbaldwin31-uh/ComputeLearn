import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = request.nextUrl.searchParams.get("lessonId");

  try {
    const attempts = await prisma.labAttempt.findMany({
      where: {
        userId: session.user.id,
        ...(lessonId && { lessonId }),
      },
    });
    return NextResponse.json({ attempts });
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

  const { lessonId, templateId, attempt, files, passed } = body as Record<
    string,
    unknown
  >;

  if (!lessonId || typeof lessonId !== "string") {
    return NextResponse.json(
      { error: "lessonId is required" },
      { status: 400 },
    );
  }

  if (!templateId || typeof templateId !== "string") {
    return NextResponse.json(
      { error: "templateId is required" },
      { status: 400 },
    );
  }

  if (typeof attempt !== "number" || !Number.isInteger(attempt) || attempt < 1) {
    return NextResponse.json(
      { error: "attempt must be a positive integer" },
      { status: 400 },
    );
  }

  if (!files || typeof files !== "object" || Array.isArray(files)) {
    return NextResponse.json(
      { error: "files must be an object" },
      { status: 400 },
    );
  }

  if (typeof passed !== "boolean") {
    return NextResponse.json(
      { error: "passed must be a boolean" },
      { status: 400 },
    );
  }

  try {
    const labAttempt = await prisma.labAttempt.create({
      data: {
        userId: session.user.id,
        lessonId,
        templateId,
        attempt,
        files,
        passed,
      },
    });
    return NextResponse.json({ attempt: labAttempt }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
