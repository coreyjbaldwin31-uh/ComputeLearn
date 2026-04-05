import { isLtiConfigured, ltiConfig } from "@/lib/lti-config";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface LtiClaims {
  sub?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  roles?: string[];
  custom?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Decode a base64url string to UTF-8 text.
 */
function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Decode a JWT and return its payload without cryptographic verification.
 * Full JWKS verification will be added when Canvas keys are available.
 */
function decodeJwtPayload(token: string): LtiClaims {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT structure: expected 3 parts");
  }
  const payload = JSON.parse(base64UrlDecode(parts[1])) as LtiClaims;
  return payload;
}

/**
 * LTI 1.3 OIDC callback.
 * Canvas POSTs the id_token here after authentication.
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

  let body: URLSearchParams;
  try {
    const text = await request.text();
    body = new URLSearchParams(text);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const idToken = body.get("id_token");
  const state = body.get("state");

  if (!idToken || !state) {
    return NextResponse.json(
      { error: "Missing required parameters: id_token, state" },
      { status: 400 },
    );
  }

  let claims: LtiClaims;
  try {
    claims = decodeJwtPayload(idToken);
  } catch {
    return NextResponse.json(
      { error: "Invalid id_token format" },
      { status: 400 },
    );
  }

  // Validate issuer matches configured platform
  if (claims.iss !== ltiConfig.platformUrl) {
    return NextResponse.json(
      { error: "Token issuer mismatch" },
      { status: 403 },
    );
  }

  // Validate audience contains our client ID
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(ltiConfig.clientId)) {
    return NextResponse.json(
      { error: "Token audience mismatch" },
      { status: 403 },
    );
  }

  const email = claims.email;
  const name =
    claims.name ||
    [claims.given_name, claims.family_name].filter(Boolean).join(" ") ||
    null;

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "No email claim in id_token" },
      { status: 400 },
    );
  }

  // Upsert user — create if not found, update name if changed
  try {
    await prisma.user.upsert({
      where: { email },
      update: { name: name || undefined },
      create: { email, name },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to provision user" },
      { status: 500 },
    );
  }

  // Determine redirect target from LTI custom parameters
  const custom = claims.custom ?? {};
  const lessonId = custom.lesson_id || custom.lessonId;
  const courseId = custom.course_id || custom.courseId;

  let redirectPath = "/";
  if (lessonId) {
    redirectPath = `/academy/lessons/${encodeURIComponent(lessonId)}`;
  } else if (courseId) {
    redirectPath = `/academy/courses/${encodeURIComponent(courseId)}`;
  }

  // Redirect to target — session creation is handled by NextAuth
  // when the user next hits a protected page with their email in the DB
  const redirectUrl = `${ltiConfig.toolUrl}${redirectPath}`;
  return NextResponse.redirect(redirectUrl, 302);
}
