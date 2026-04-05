import { requireRole } from "@/lib/auth-helpers";
import { isLtiConfigured } from "@/lib/lti-config";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type LtiGradeSyncRecord = {
  id: string;
};

type LtiGradeSyncCreateInput = {
  userId: string;
  lessonId: string;
  grade: number;
  comment: string | null;
  synced: boolean;
};

type LtiGradeSyncDelegate = {
  create: (args: {
    data: LtiGradeSyncCreateInput;
  }) => Promise<LtiGradeSyncRecord>;
};

type PrismaWithLtiGradeSync = {
  ltiGradeSync?: LtiGradeSyncDelegate;
};

function getLtiGradeSyncDelegate(): LtiGradeSyncDelegate | null {
  const candidate = (prisma as unknown as PrismaWithLtiGradeSync).ltiGradeSync;
  return candidate?.create ? candidate : null;
}

/**
 * LTI Assignment and Grade Services (AGS) — grade passback to Canvas.
 * V1: stores the grade passback request. Actual HTTP call to Canvas
 * will be made when Canvas keys are fully configured.
 */
export async function POST(request: NextRequest) {
  if (!isLtiConfigured()) {
    return NextResponse.json(
      {
        error: "LTI integration is not configured",
        detail:
          "Set LTI_PLATFORM_URL, LTI_CLIENT_ID, LTI_AUTH_ENDPOINT, and LTI_TOKEN_ENDPOINT environment variables.",
      },
      { status: 503 },
    );
  }

  const authResult = await requireRole(["INSTRUCTOR"]);
  if (authResult.error) return authResult.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { userId, lessonId, grade, comment } = body as Record<string, unknown>;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (!lessonId || typeof lessonId !== "string") {
    return NextResponse.json(
      { error: "lessonId is required" },
      { status: 400 },
    );
  }

  if (typeof grade !== "number" || grade < 0 || grade > 100) {
    return NextResponse.json(
      { error: "grade must be a number between 0 and 100" },
      { status: 400 },
    );
  }

  if (comment !== undefined && typeof comment !== "string") {
    return NextResponse.json(
      { error: "comment must be a string" },
      { status: 400 },
    );
  }

  // Verify the target user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ltiGradeSync = getLtiGradeSyncDelegate();
  if (!ltiGradeSync) {
    return NextResponse.json(
      { error: "LTI grade sync persistence is not available" },
      { status: 503 },
    );
  }

  try {
    const record = await ltiGradeSync.create({
      data: {
        userId,
        lessonId,
        grade,
        comment: (comment as string) || null,
        synced: false,
      },
    });

    return NextResponse.json({
      id: record.id,
      userId,
      lessonId,
      grade,
      comment: comment || null,
      synced: false,
      message:
        "Grade passback recorded. Sync to Canvas will occur when AGS credentials are fully configured.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to record grade passback" },
      { status: 500 },
    );
  }
}
