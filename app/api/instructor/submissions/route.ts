import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const result = await requireRole(["INSTRUCTOR", "TA"]);
  if (result.error) return result.error;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (
    status === "DRAFT" ||
    status === "SUBMITTED" ||
    status === "REVIEWED"
  ) {
    where.status = status;
  }

  try {
    const submissions = await prisma.submission.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ submissions });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
