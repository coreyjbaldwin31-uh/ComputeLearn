import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Audit event actions tracked by the platform.
 */
export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "PROGRESS_UPDATE"
  | "SUBMISSION_CREATE"
  | "SUBMISSION_REVIEW"
  | "GRADE_EXPORT"
  | "ENROLLMENT_CHANGE"
  | "DATA_EXPORT"
  | "ACCOUNT_DELETE";

export interface AuditEvent {
  userId?: string | null;
  action: AuditAction;
  resource: string;
  details?: Record<string, unknown>;
  ip?: string | null;
}

/**
 * Write an audit log entry.
 *
 * Fire-and-forget: the caller does not need to await this, and failures
 * are logged to stderr rather than propagated to request handlers.
 */
export function auditLog(event: AuditEvent): void {
  prisma.auditLog
    .create({
      data: {
        userId: event.userId ?? null,
        action: event.action,
        resource: event.resource,
        details: (event.details as Prisma.InputJsonValue) ?? undefined,
        ip: event.ip ?? null,
      },
    })
    .catch((err: unknown) => {
      console.error("[audit-log] Failed to write audit event:", err);
    });
}
