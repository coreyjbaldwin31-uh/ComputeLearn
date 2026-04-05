import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const competencies = await prisma.competencySnapshot.findMany({
      where: { userId: session.user.id },
    });
    return NextResponse.json({ competencies });
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

  const { domain, level } = body as Record<string, unknown>;

  if (!domain || typeof domain !== "string") {
    return NextResponse.json(
      { error: "domain is required" },
      { status: 400 },
    );
  }

  if (typeof level !== "number") {
    return NextResponse.json(
      { error: "level must be a number" },
      { status: 400 },
    );
  }

  try {
    const competency = await prisma.competencySnapshot.upsert({
      where: {
        userId_domain: {
          userId: session.user.id,
          domain,
        },
      },
      create: {
        userId: session.user.id,
        domain,
        level,
      },
      update: {
        level,
      },
    });
    return NextResponse.json({ competency });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
