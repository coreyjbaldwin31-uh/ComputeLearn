import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const APP_VERSION = process.env.npm_package_version ?? "0.2.0";

/**
 * GET /api/health
 *
 * Readiness probe for Docker healthchecks, load balancers, and uptime monitors.
 * Returns 200 when healthy, 503 when unhealthy.
 */
export async function GET() {
  let dbHealthy = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    // database unreachable
  }

  const status = dbHealthy ? "healthy" : "unhealthy";

  const body = {
    status,
    checks: {
      database: dbHealthy,
      uptime: process.uptime(),
      version: APP_VERSION,
    },
  };

  return NextResponse.json(body, {
    status: dbHealthy ? 200 : 503,
  });
}
