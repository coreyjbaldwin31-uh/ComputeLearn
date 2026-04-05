import { auth } from "@/auth";
import { auditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/account/delete
 *
 * Authenticated user requests full account deletion.
 * Deletes all user data and logs the event for compliance.
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const ip = request.headers.get("x-forwarded-for") ?? null;

  try {
    // Delete in dependency order (all have onDelete: Cascade on User,
    // but explicit deletion ensures clarity and audit-ability).
    await prisma.$transaction([
      prisma.ltiGradeSync.deleteMany({ where: { userId } }),
      prisma.competencySnapshot.deleteMany({ where: { userId } }),
      prisma.labAttempt.deleteMany({ where: { userId } }),
      prisma.submission.deleteMany({ where: { userId } }),
      prisma.progress.deleteMany({ where: { userId } }),
      prisma.enrollment.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    // Log after deletion — userId is retained in the audit log for compliance
    // but the user record no longer exists.
    auditLog({
      userId,
      action: "ACCOUNT_DELETE",
      resource: `/users/${userId}`,
      ip,
      details: { initiator: "self" },
    });

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
