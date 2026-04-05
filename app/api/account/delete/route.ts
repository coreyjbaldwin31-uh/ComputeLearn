import { auth } from "@/auth";
import { auditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type DeleteManyDelegate = {
  deleteMany: (args: { where: { userId: string } }) => Promise<unknown>;
};

type UserDeleteDelegate = {
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

type AccountDeleteDelegates = {
  ltiGradeSync?: DeleteManyDelegate;
  competencySnapshot: DeleteManyDelegate;
  labAttempt: DeleteManyDelegate;
  submission: DeleteManyDelegate;
  progress: DeleteManyDelegate;
  enrollment: DeleteManyDelegate;
  session: DeleteManyDelegate;
  account: DeleteManyDelegate;
  user: UserDeleteDelegate;
};

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
    await prisma.$transaction(async (tx) => {
      const delegates = tx as unknown as AccountDeleteDelegates;

      if (delegates.ltiGradeSync?.deleteMany) {
        await delegates.ltiGradeSync.deleteMany({ where: { userId } });
      }

      await delegates.competencySnapshot.deleteMany({ where: { userId } });
      await delegates.labAttempt.deleteMany({ where: { userId } });
      await delegates.submission.deleteMany({ where: { userId } });
      await delegates.progress.deleteMany({ where: { userId } });
      await delegates.enrollment.deleteMany({ where: { userId } });
      await delegates.session.deleteMany({ where: { userId } });
      await delegates.account.deleteMany({ where: { userId } });
      await delegates.user.delete({ where: { id: userId } });
    });

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
