import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Lightweight readiness probe for Docker healthchecks and load balancers.
 * Returns 200 with uptime and timestamp.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
