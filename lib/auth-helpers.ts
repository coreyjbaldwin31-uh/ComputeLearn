import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Session } from "next-auth";

type Role = "STUDENT" | "INSTRUCTOR" | "TA";

/**
 * Require an authenticated session. Returns the session or a 401 response.
 */
export async function requireAuth(): Promise<
  | { session: Session & { user: { id: string } }; error?: never }
  | { session?: never; error: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session: session as Session & { user: { id: string } } };
}

/**
 * Require an authenticated session with one of the specified roles.
 * Returns the session or a 401/403 response.
 */
export async function requireRole(roles: Role[]): Promise<
  | { session: Session & { user: { id: string; role: Role } }; error?: never }
  | { session?: never; error: NextResponse }
> {
  const result = await requireAuth();
  if (result.error) return result;

  const userRole = (result.session.user.role ?? "STUDENT") as Role;
  if (!roles.includes(userRole)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return {
    session: result.session as Session & { user: { id: string; role: Role } },
  };
}

/**
 * Get the current user's role from the server session, or null if unauthenticated.
 */
export async function getSessionRole(): Promise<Role | null> {
  const session = await auth();
  if (!session?.user) return null;
  return (session.user.role ?? "STUDENT") as Role;
}
