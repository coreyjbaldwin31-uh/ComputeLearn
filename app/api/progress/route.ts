import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const progress = await prisma.progress.findMany({
      where: { userId: session.user.id },
    });
    return NextResponse.json({ progress });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
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

  const { lessonId, step, completed, notes, reflection } = body as Record<
    string,
    unknown
  >;

  if (!lessonId || typeof lessonId !== "string") {
    return NextResponse.json(
      { error: "lessonId is required" },
      { status: 400 },
    );
  }

  try {
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
      create: {
        userId: session.user.id,
        lessonId,
        step: typeof step === "number" ? step : 0,
        completed: typeof completed === "boolean" ? completed : false,
        notes: typeof notes === "string" ? notes : null,
        reflection: typeof reflection === "string" ? reflection : null,
      },
      update: {
        ...(typeof step === "number" && { step }),
        ...(typeof completed === "boolean" && { completed }),
        ...(typeof notes === "string" && { notes }),
        ...(typeof reflection === "string" && { reflection }),
      },
    });
    return NextResponse.json({ progress });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
