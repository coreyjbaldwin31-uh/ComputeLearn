import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

/**
 * GET /api/sentry-test
 *
 * Fires a test event to Sentry so operators can verify the DSN
 * and pipeline without relying on browser console injection.
 *
 * Only active when SENTRY_DSN is set. Returns the event ID on success.
 */
export async function GET() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return NextResponse.json(
      { ok: false, message: "SENTRY_DSN is not configured" },
      { status: 503 },
    );
  }

  const eventId = Sentry.captureMessage("sentry-test-route-ping", {
    level: "info",
    tags: { source: "api-sentry-test" },
  });

  await Sentry.flush(5000);

  return NextResponse.json({ ok: true, eventId });
}
